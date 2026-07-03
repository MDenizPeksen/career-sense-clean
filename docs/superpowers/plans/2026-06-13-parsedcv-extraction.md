# ParsedCV Structured Extraction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-stage structured extraction step to the CV pipeline — raw text → `ParsedCV` JSON (via `gpt-4o-mini`) → structured section-labelled text — so the existing analysis prompt receives clean, section-aware input instead of a raw PDF/DOCX blob, while keeping the current `/analyze` response shape fully backward-compatible.

**Architecture:** `fileProcessingService.extractTextFromFile()` is unchanged. A new `cvParsingService.parseCvStructure()` calls `gpt-4o-mini` with a focused extraction prompt to produce a clean `ParsedCV` JSON object. A pure `parsedCvToText()` adapter converts `ParsedCV` to a structured, section-labelled text string that the existing `analysisPrompt.js` consumes. `ParsedCV` is attached to the analysis payload as `parsed_cv` for Phase 2.2 to use. All existing `/analyze` response fields are unchanged.

**Tech Stack:** Node.js (CommonJS), `gpt-4o-mini` via the existing `callOpenAIJson` helper in `openaiService.js`, `node:test` + `node:assert/strict` for unit tests.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/services/cvParsingService.js` | Create | `normalizeParsedCV()` (pure), `parsedCvToText()` (pure), `parseCvStructure()` (async, LLM) |
| `backend/services/prompts/cvParsePrompt.js` | Create | Extraction prompt — instructs LLM to emit `ParsedCV` JSON |
| `backend/test/cvParsingService.test.js` | Create | Unit tests for both pure functions using fixtures (no LLM calls) |
| `backend/controllers/cvController.js` | Modify | Thread the two new stages into the pipeline |

---

### Task 1: Write failing tests for `normalizeParsedCV()`

**Files:**
- Create: `backend/test/cvParsingService.test.js`

- [ ] **Step 1: Create the test file**

Create `backend/test/cvParsingService.test.js` with the following content:

```javascript
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeParsedCV } = require('../services/cvParsingService');

test('normalizeParsedCV: returns safe defaults for null/non-object/array', () => {
  const empty = { contact: {}, experience: [], education: [], skills: [] };
  assert.deepEqual(normalizeParsedCV(null), empty);
  assert.deepEqual(normalizeParsedCV('bad input'), empty);
  assert.deepEqual(normalizeParsedCV(undefined), empty);
  assert.deepEqual(normalizeParsedCV([]), empty);
});

test('normalizeParsedCV: passes through a well-formed object', () => {
  const raw = {
    contact: { name: 'Jane Smith', email: 'jane@example.com' },
    summary: 'Experienced engineer.',
    experience: [
      {
        title: 'Engineer', company: 'Acme', location: 'Berlin',
        start_date: '2020-01', end_date: 'Present',
        bullets: ['Built X', 'Led Y'],
      },
    ],
    education: [
      { degree: 'MSc', field: 'Computer Science', institution: 'TU Berlin', start_date: '2016', end_date: '2018' },
    ],
    skills: ['Python', 'JavaScript'],
    certifications: ['AWS SAA'],
    languages: ['English', 'German'],
  };
  const result = normalizeParsedCV(raw);
  assert.equal(result.contact.name, 'Jane Smith');
  assert.equal(result.summary, 'Experienced engineer.');
  assert.equal(result.experience.length, 1);
  assert.equal(result.experience[0].title, 'Engineer');
  assert.deepEqual(result.experience[0].bullets, ['Built X', 'Led Y']);
  assert.equal(result.education.length, 1);
  assert.deepEqual(result.skills, ['Python', 'JavaScript']);
  assert.deepEqual(result.certifications, ['AWS SAA']);
  assert.deepEqual(result.languages, ['English', 'German']);
});

test('normalizeParsedCV: trims whitespace and filters malformed entries', () => {
  const raw = {
    contact: {},
    experience: [
      null,
      { title: '  Engineer  ', company: '  Acme  ', bullets: [' Built X ', 42, null, ''] },
      { title: '', company: '', bullets: [] },
    ],
    education: [],
    skills: ['Python', '', null, 42, 'JavaScript'],
  };
  const result = normalizeParsedCV(raw);
  assert.equal(result.experience.length, 2);
  assert.equal(result.experience[0].title, 'Engineer');
  assert.equal(result.experience[0].company, 'Acme');
  assert.deepEqual(result.experience[0].bullets, ['Built X']);
  assert.deepEqual(result.skills, ['Python', 'JavaScript']);
});

test('normalizeParsedCV: omits optional fields when absent from input', () => {
  const raw = { contact: {}, experience: [], education: [], skills: [] };
  const result = normalizeParsedCV(raw);
  assert.equal(result.summary, undefined);
  assert.equal(result.certifications, undefined);
  assert.equal(result.languages, undefined);
});
```

- [ ] **Step 2: Run the tests and verify they fail**

```bash
cd backend && node --test test/cvParsingService.test.js
```

Expected: 4 failing tests with `Cannot find module '../services/cvParsingService'`

---

### Task 2: Implement `normalizeParsedCV()` to pass the tests

**Files:**
- Create: `backend/services/cvParsingService.js`

- [ ] **Step 1: Create `cvParsingService.js` with `normalizeParsedCV()`**

Create `backend/services/cvParsingService.js`:

```javascript
'use strict';

/**
 * @typedef {{ name?: string, email?: string, phone?: string, location?: string, linkedin?: string, portfolio_url?: string }} CvContact
 * @typedef {{ title: string, company: string, location?: string, start_date?: string, end_date?: string, bullets: string[] }} CvExperience
 * @typedef {{ degree: string, field?: string, institution: string, start_date?: string, end_date?: string }} CvEducation
 * @typedef {{ contact: CvContact, summary?: string, experience: CvExperience[], education: CvEducation[], skills: string[], certifications?: string[], languages?: string[] }} ParsedCV
 */

/**
 * Normalize raw LLM JSON into a clean ParsedCV.
 * Defensive — never throws; always returns a structurally valid shape.
 * Exported for unit testing.
 * @param {any} raw
 * @returns {ParsedCV}
 */
function normalizeParsedCV(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { contact: {}, experience: [], education: [], skills: [] };
  }

  const contact =
    raw.contact && typeof raw.contact === 'object' && !Array.isArray(raw.contact)
      ? raw.contact
      : {};

  const summary =
    typeof raw.summary === 'string' && raw.summary.trim()
      ? raw.summary.trim()
      : undefined;

  const experience = Array.isArray(raw.experience)
    ? raw.experience
        .filter((e) => e && typeof e === 'object')
        .map((e) => ({
          title: typeof e.title === 'string' ? e.title.trim() : '',
          company: typeof e.company === 'string' ? e.company.trim() : '',
          ...(typeof e.location === 'string' && e.location.trim()
            ? { location: e.location.trim() } : {}),
          ...(typeof e.start_date === 'string' && e.start_date.trim()
            ? { start_date: e.start_date.trim() } : {}),
          ...(typeof e.end_date === 'string' && e.end_date.trim()
            ? { end_date: e.end_date.trim() } : {}),
          bullets: Array.isArray(e.bullets)
            ? e.bullets
                .filter((b) => typeof b === 'string' && b.trim())
                .map((b) => b.trim())
            : [],
        }))
    : [];

  const education = Array.isArray(raw.education)
    ? raw.education
        .filter((e) => e && typeof e === 'object')
        .map((e) => ({
          degree: typeof e.degree === 'string' ? e.degree.trim() : '',
          ...(typeof e.field === 'string' && e.field.trim()
            ? { field: e.field.trim() } : {}),
          institution: typeof e.institution === 'string' ? e.institution.trim() : '',
          ...(typeof e.start_date === 'string' && e.start_date.trim()
            ? { start_date: e.start_date.trim() } : {}),
          ...(typeof e.end_date === 'string' && e.end_date.trim()
            ? { end_date: e.end_date.trim() } : {}),
        }))
    : [];

  const skills = Array.isArray(raw.skills)
    ? raw.skills.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
    : [];

  const certifications = Array.isArray(raw.certifications)
    ? raw.certifications.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
    : undefined;

  const languages = Array.isArray(raw.languages)
    ? raw.languages.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
    : undefined;

  return {
    contact,
    ...(summary !== undefined ? { summary } : {}),
    experience,
    education,
    skills,
    ...(certifications !== undefined ? { certifications } : {}),
    ...(languages !== undefined ? { languages } : {}),
  };
}

module.exports = { normalizeParsedCV };
```

- [ ] **Step 2: Run the tests and verify they pass**

```bash
cd backend && node --test test/cvParsingService.test.js
```

Expected: 4 passing tests

- [ ] **Step 3: Commit**

```bash
cd /Users/denizpeksen/Documents/career-sense/career-sense-clean
git add backend/services/cvParsingService.js backend/test/cvParsingService.test.js
git commit -m "feat(2.1): normalizeParsedCV pure function + tests"
```

---

### Task 3: Write failing tests for `parsedCvToText()` and run them

**Files:**
- Modify: `backend/test/cvParsingService.test.js`

- [ ] **Step 1: Update the require line at the top of the test file**

Change the first require line in `backend/test/cvParsingService.test.js` from:

```javascript
const { normalizeParsedCV } = require('../services/cvParsingService');
```

to:

```javascript
const { normalizeParsedCV, parsedCvToText } = require('../services/cvParsingService');
```

- [ ] **Step 2: Append these tests to the bottom of `backend/test/cvParsingService.test.js`**

```javascript
// ---- parsedCvToText tests -----------------------------------------------

test('parsedCvToText: includes CONTACT section with present fields', () => {
  const cv = normalizeParsedCV({
    contact: {
      name: 'Jane Smith', email: 'jane@example.com',
      location: 'Berlin, Germany', linkedin: 'https://linkedin.com/in/jane',
    },
    experience: [], education: [], skills: [],
  });
  const text = parsedCvToText(cv);
  assert.match(text, /=== CONTACT ===/);
  assert.match(text, /Name: Jane Smith/);
  assert.match(text, /Email: jane@example\.com/);
  assert.match(text, /Location: Berlin, Germany/);
  assert.match(text, /LinkedIn: https:\/\/linkedin\.com\/in\/jane/);
});

test('parsedCvToText: includes WORK EXPERIENCE with pipe-delimited header and bullets', () => {
  const cv = normalizeParsedCV({
    contact: {},
    experience: [
      {
        title: 'Software Engineer', company: 'Acme', location: 'Berlin',
        start_date: '2020-01', end_date: 'Present',
        bullets: ['Built X', 'Led Y'],
      },
    ],
    education: [], skills: [],
  });
  const text = parsedCvToText(cv);
  assert.match(text, /=== WORK EXPERIENCE ===/);
  assert.match(text, /Software Engineer \| Acme \| Berlin \| 2020-01 – Present/);
  assert.match(text, /• Built X/);
  assert.match(text, /• Led Y/);
});

test('parsedCvToText: includes EDUCATION section', () => {
  const cv = normalizeParsedCV({
    contact: {},
    experience: [],
    education: [
      { degree: 'MSc', field: 'Computer Science', institution: 'TU Berlin', start_date: '2016', end_date: '2018' },
    ],
    skills: [],
  });
  const text = parsedCvToText(cv);
  assert.match(text, /=== EDUCATION ===/);
  assert.match(text, /MSc in Computer Science \| TU Berlin \| 2016 – 2018/);
});

test('parsedCvToText: includes SKILLS, CERTIFICATIONS, LANGUAGES sections', () => {
  const cv = normalizeParsedCV({
    contact: {},
    experience: [], education: [],
    skills: ['Python', 'JavaScript'],
    certifications: ['AWS SAA'],
    languages: ['English', 'German'],
  });
  const text = parsedCvToText(cv);
  assert.match(text, /=== SKILLS ===/);
  assert.match(text, /Python, JavaScript/);
  assert.match(text, /=== CERTIFICATIONS ===/);
  assert.match(text, /• AWS SAA/);
  assert.match(text, /=== LANGUAGES ===/);
  assert.match(text, /English, German/);
});

test('parsedCvToText: omits sections that are empty or absent', () => {
  const cv = normalizeParsedCV({ contact: {}, experience: [], education: [], skills: [] });
  const text = parsedCvToText(cv);
  assert.doesNotMatch(text, /=== WORK EXPERIENCE ===/);
  assert.doesNotMatch(text, /=== EDUCATION ===/);
  assert.doesNotMatch(text, /=== SKILLS ===/);
  assert.doesNotMatch(text, /=== PROFESSIONAL SUMMARY ===/);
  assert.doesNotMatch(text, /=== CERTIFICATIONS ===/);
  assert.doesNotMatch(text, /=== LANGUAGES ===/);
});
```

- [ ] **Step 3: Run the tests — first 4 pass, new 5 fail**

```bash
cd backend && node --test test/cvParsingService.test.js
```

Expected: 4 `normalizeParsedCV` tests pass; 5 `parsedCvToText` tests fail with `parsedCvToText is not a function`

---

### Task 4: Implement `parsedCvToText()` to pass the tests

**Files:**
- Modify: `backend/services/cvParsingService.js`

- [ ] **Step 1: Add `parsedCvToText()` to `cvParsingService.js`**

Add this function after `normalizeParsedCV` (before `module.exports`):

```javascript
/**
 * Convert a ParsedCV into a structured text string for the analysis prompt.
 * Clear section headers and bullet formatting let gpt-4o-mini reliably
 * identify sections, roles, and achievements without re-discovering structure.
 * Pure — no I/O. Exported for unit testing.
 * @param {ParsedCV} cv
 * @returns {string}
 */
function parsedCvToText(cv) {
  const sections = [];

  // CONTACT
  const c = cv.contact || {};
  const contactLines = ['=== CONTACT ==='];
  if (c.name) contactLines.push(`Name: ${c.name}`);
  if (c.email) contactLines.push(`Email: ${c.email}`);
  if (c.phone) contactLines.push(`Phone: ${c.phone}`);
  if (c.location) contactLines.push(`Location: ${c.location}`);
  if (c.linkedin) contactLines.push(`LinkedIn: ${c.linkedin}`);
  if (c.portfolio_url) contactLines.push(`Portfolio: ${c.portfolio_url}`);
  sections.push(contactLines.join('\n'));

  // PROFESSIONAL SUMMARY
  if (cv.summary) {
    sections.push(`=== PROFESSIONAL SUMMARY ===\n${cv.summary}`);
  }

  // WORK EXPERIENCE
  if (cv.experience && cv.experience.length > 0) {
    const expLines = ['=== WORK EXPERIENCE ==='];
    for (const exp of cv.experience) {
      const parts = [exp.title, exp.company];
      if (exp.location) parts.push(exp.location);
      if (exp.start_date || exp.end_date) {
        parts.push(`${exp.start_date || '?'} – ${exp.end_date || 'Present'}`);
      }
      expLines.push(parts.join(' | '));
      for (const bullet of (exp.bullets || [])) {
        expLines.push(`• ${bullet}`);
      }
      expLines.push('');
    }
    sections.push(expLines.join('\n').trimEnd());
  }

  // EDUCATION
  if (cv.education && cv.education.length > 0) {
    const eduLines = ['=== EDUCATION ==='];
    for (const edu of cv.education) {
      const degreePart = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
      const parts = [degreePart, edu.institution];
      if (edu.start_date || edu.end_date) {
        parts.push(`${edu.start_date || '?'} – ${edu.end_date || '?'}`);
      }
      eduLines.push(parts.join(' | '));
    }
    sections.push(eduLines.join('\n'));
  }

  // SKILLS
  if (cv.skills && cv.skills.length > 0) {
    sections.push(`=== SKILLS ===\n${cv.skills.join(', ')}`);
  }

  // CERTIFICATIONS
  if (cv.certifications && cv.certifications.length > 0) {
    const certLines = ['=== CERTIFICATIONS ==='];
    for (const cert of cv.certifications) certLines.push(`• ${cert}`);
    sections.push(certLines.join('\n'));
  }

  // LANGUAGES
  if (cv.languages && cv.languages.length > 0) {
    sections.push(`=== LANGUAGES ===\n${cv.languages.join(', ')}`);
  }

  return sections.join('\n\n');
}
```

Update `module.exports` at the bottom of `cvParsingService.js`:

```javascript
module.exports = { normalizeParsedCV, parsedCvToText };
```

- [ ] **Step 2: Run all tests — all 9 should pass**

```bash
cd backend && node --test test/cvParsingService.test.js
```

Expected: all 9 tests pass

- [ ] **Step 3: Commit**

```bash
cd /Users/denizpeksen/Documents/career-sense/career-sense-clean
git add backend/services/cvParsingService.js backend/test/cvParsingService.test.js
git commit -m "feat(2.1): parsedCvToText adapter — structured section-labelled text from ParsedCV"
```

---

### Task 5: Create `cvParsePrompt.js` and add `parseCvStructure()` to `cvParsingService.js`

**Files:**
- Create: `backend/services/prompts/cvParsePrompt.js`
- Modify: `backend/services/cvParsingService.js`

- [ ] **Step 1: Create the extraction prompt**

Create `backend/services/prompts/cvParsePrompt.js`:

```javascript
/**
 * Prompt for the structured CV extraction stage (Phase 2.1).
 * Low temperature (0.1) — this is extraction, not generation.
 * Verbatim bullets are critical: the analysis stage cites them as evidence.
 */
module.exports = function cvParsePrompt(rawText) {
  return `Extract structured information from the following CV/resume text into JSON.

Resume Text:
"""
${rawText}
"""

Return ONLY a valid JSON object with this exact structure:
{
  "contact": {
    "name": "Full name as written, or null",
    "email": "Email address or null",
    "phone": "Phone number or null",
    "location": "City, Country format or null",
    "linkedin": "Full LinkedIn URL or null",
    "portfolio_url": "Portfolio or personal website URL or null"
  },
  "summary": "Professional summary paragraph verbatim if present, otherwise null",
  "experience": [
    {
      "title": "Job title",
      "company": "Company or organisation name",
      "location": "City, Country or null",
      "start_date": "YYYY-MM or YYYY or null",
      "end_date": "YYYY-MM or YYYY or 'Present' or null",
      "bullets": ["Achievement or responsibility copied verbatim from the CV", "..."]
    }
  ],
  "education": [
    {
      "degree": "Full degree name (e.g. 'Bachelor of Science', 'MSc', 'MBA')",
      "field": "Field of study or null",
      "institution": "University or school name",
      "start_date": "YYYY or null",
      "end_date": "YYYY or null"
    }
  ],
  "skills": ["skill1", "skill2"],
  "certifications": ["certification name"] or null,
  "languages": ["English", "German"] or null
}

Rules:
- List experience in reverse-chronological order (most recent first)
- Copy bullets VERBATIM from the CV — do NOT rewrite, summarise, or invent new content
- Use null for any field not found in the CV
- Return ONLY the JSON object, no other text`;
};
```

- [ ] **Step 2: Add imports and `parseCvStructure()` to `cvParsingService.js`**

At the very top of `backend/services/cvParsingService.js`, after `'use strict';`, add:

```javascript
const { callOpenAIJson } = require('./openaiService');
const { ValidationError } = require('../utils/errors');
const cvParsePrompt = require('./prompts/cvParsePrompt');
```

Add this function after `parsedCvToText` (before `module.exports`):

```javascript
/**
 * Parse raw CV text into a structured ParsedCV using gpt-4o-mini.
 * One cheap, low-temperature call — extraction only, no invented content.
 * @param {string} rawText
 * @returns {Promise<ParsedCV>}
 */
async function parseCvStructure(rawText) {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 50) {
    throw new ValidationError(
      'Invalid CV text',
      'CV text must be a string with at least 50 characters'
    );
  }
  const raw = await callOpenAIJson({
    system: 'You are a precise CV data extractor. Return only valid JSON matching the requested schema.',
    user: cvParsePrompt(rawText),
    maxTokens: 1500,
    temperature: 0.1,
  });
  return normalizeParsedCV(raw);
}
```

Update `module.exports`:

```javascript
module.exports = { normalizeParsedCV, parsedCvToText, parseCvStructure };
```

- [ ] **Step 3: Run the full test suite to confirm nothing broke**

```bash
cd backend && npm test
```

Expected: all existing tests still pass

- [ ] **Step 4: Commit**

```bash
cd /Users/denizpeksen/Documents/career-sense/career-sense-clean
git add backend/services/prompts/cvParsePrompt.js backend/services/cvParsingService.js
git commit -m "feat(2.1): cvParsePrompt + parseCvStructure LLM extraction stage"
```

---

### Task 6: Update `cvController.js` to thread ParsedCV through the pipeline

**Files:**
- Modify: `backend/controllers/cvController.js`

- [ ] **Step 1: Replace the contents of `backend/controllers/cvController.js`**

```javascript
const openaiService = require('../services/openaiService');
const fileService = require('../services/fileProcessingService');
const cvParsingService = require('../services/cvParsingService');
const { ValidationError } = require('../utils/errors');
const { getRequestUserId } = require('../middleware/authMiddleware');
const { saveAnalysis, getLatestAnalysis } = require('../db/analyses');
const { enrichLearningRoadmap } = require('../services/analysisEnrichment');

// CV analysis controller
exports.analyzeCV = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded', 'Please upload a file to analyze');
    }

    const filePath = req.file.path;
    console.log(`Processing file: ${filePath}`);

    try {
      // Stage 1: Extract raw text from the uploaded file (pdf-parse / mammoth)
      const rawText = await fileService.extractTextFromFile(req.file);

      // Stage 2: Parse into structured ParsedCV (cheap gpt-4o-mini extraction call)
      const parsedCv = await cvParsingService.parseCvStructure(rawText);

      // Stage 3: Convert ParsedCV → structured section-labelled text for the analysis prompt
      const structuredText = cvParsingService.parsedCvToText(parsedCv);

      // Stage 4: Full analysis against the structured text (existing prompt, unchanged)
      const analysis = await openaiService.analyzeCV(structuredText);

      // Attach ParsedCV to the payload so Phase 2.2 can use structured data directly
      analysis.parsed_cv = parsedCv;

      // Attach real, clickable course links (deterministic, code-side).
      enrichLearningRoadmap(analysis);

      // Best-effort persistence: never let a DB hiccup fail the analysis response.
      const userId = getRequestUserId(req);
      if (userId) {
        saveAnalysis(userId, analysis).catch((err) =>
          console.error('Failed to persist analysis:', err.message)
        );
      }

      return res.json(analysis);
    } finally {
      // Always clean up the uploaded temp file, on success or failure.
      if (filePath) {
        fileService.deleteFile(filePath);
      }
    }
  } catch (error) {
    next(error);
  }
};

// Return the signed-in user's most recent analysis (or null).
exports.getLatestAnalysis = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.json({ analysis: null });
    }
    const analysis = await getLatestAnalysis(userId);
    return res.json({ analysis: enrichLearningRoadmap(analysis) });
  } catch (error) {
    next(error);
  }
};
```

- [ ] **Step 2: Run the full test suite**

```bash
cd backend && npm test
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
cd /Users/denizpeksen/Documents/career-sense/career-sense-clean
git add backend/controllers/cvController.js
git commit -m "feat(2.1): thread ParsedCV through CV analysis pipeline in cvController"
```

---

### Task 7: Smoke-test the end-to-end pipeline

- [ ] **Step 1: Start the backend**

```bash
cd backend && npm run dev
```

Expected: server starts on port 5001, no errors, `✅ OpenAI connection successful` in logs

- [ ] **Step 2: Confirm the health endpoint**

```bash
curl -s http://localhost:5001/health | jq .
```

Expected: `{ "status": "ok", ... }`

- [ ] **Step 3: Upload a test CV and verify `parsed_cv` is populated**

With `AUTH_ENABLED=false` in `backend/.env`:

```bash
curl -s -X POST http://localhost:5001/api/cv/analyze \
  -F "cv=@/path/to/test-cv.pdf" | jq '{
    contact: .parsed_cv.contact.name,
    experience_count: (.parsed_cv.experience | length),
    skills_count: (.parsed_cv.skills | length)
  }'
```

Expected: `contact` is a non-null name string, `experience_count` ≥ 1, `skills_count` ≥ 1

- [ ] **Step 4: Verify existing analysis fields are still present**

```bash
curl -s -X POST http://localhost:5001/api/cv/analyze \
  -F "cv=@/path/to/test-cv.pdf" | jq '{
    profile_name: .user_profile.name,
    role_count: (.role_matching | length),
    star_count: (.star_interview_stories | length)
  }'
```

Expected: `profile_name` non-null, `role_count` = 3, `star_count` ≥ 1

- [ ] **Step 5: Final commit**

```bash
cd /Users/denizpeksen/Documents/career-sense/career-sense-clean
git add -A
git commit -m "feat(2.1): structured CV extraction (ParsedCV pipeline stage) complete"
```

---

## Self-Review

**Spec coverage check:**
- ✅ "layout-aware raw text → one cheap gpt-4o-mini structured parse into ParsedCV" → Task 5 (`parseCvStructure` + `cvParsePrompt`)
- ✅ "contact, experience entries w/ title/company/dates/bullets, education, skills" → `ParsedCV` typedef + `normalizeParsedCV` shape in Task 2
- ✅ "Keep current analysis working via an adapter so nothing breaks" → `parsedCvToText()` adapter in Task 4; controller feeds structured text to the existing `analyzeCV()`, response shape unchanged
- ✅ "mirror onetClient.js: pure parsers that are unit-tested against fixtures" → `normalizeParsedCV` is pure, tested with inline fixtures in Tasks 1–2; no LLM calls in tests
- ✅ Tests use `node:test` + `node:assert/strict` matching the existing test pattern in `onetClient.test.js`

**Placeholder scan:** None found. All code blocks contain complete, runnable code.

**Type consistency check:**
- `normalizeParsedCV` defined in Task 2, imported in Task 3's require line, called inside `parseCvStructure` in Task 5 ✅
- `parsedCvToText` added to exports in Task 4, imported by controller in Task 6 ✅
- `parseCvStructure` added to exports in Task 5, imported via `cvParsingService` in Task 6 ✅
- `callOpenAIJson` is imported from `'./openaiService'` — same pattern used in all existing services ✅
