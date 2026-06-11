# Phase 1 — Richer, Directive CV Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the CV analysis directive and evidence-grounded — add ranked next actions, confidence-flagged STAR stories, evidence-linked strengths, and real (clickable) course links — visible end-to-end on the Dashboard.

**Architecture:** Three prompt additions in `analysisPrompt.js` (model-produced), plus a deterministic, code-side course-link enricher (`analysisEnrichment.js`) wired into both `cvController` response paths so old and new analyses both get links. Frontend types and the Dashboard are extended with optional, guarded fields so already-saved analyses still render.

**Tech Stack:** Node/Express (CommonJS), `node:test` for backend unit tests, OpenAI `gpt-4o-mini` (JSON mode), Vite + React 19 + strict TS, Tailwind, `lucide-react`.

**Spec:** `docs/superpowers/specs/2026-06-11-phase-1-richer-cv-analysis-design.md`

**Testing note:** Only Task 1 (the pure enricher) is unit-testable. The repo has **no frontend test suite** and prompt/controller changes are integration-level, so Tasks 2–5 are verified by `npm run build` (strict typecheck), `npm test` (backend), and the manual run in Task 6. This matches existing repo conventions.

---

## File Structure

- **Create** `backend/services/analysisEnrichment.js` — pure helper: adds `learningLinks` to each learning-roadmap item from `courseProvider`. One responsibility, no I/O.
- **Create** `backend/test/analysisEnrichment.test.js` — `node:test` unit tests for the helper.
- **Modify** `backend/services/prompts/analysisPrompt.js` — add `next_actions`, STAR `confidence`/`evidence_basis`, and directive instruction text.
- **Modify** `backend/controllers/cvController.js` — call the enricher in `analyzeCV` and `getLatestAnalysis`.
- **Modify** `clerk-react/src/types/analysis.ts` — optional new fields.
- **Modify** `clerk-react/src/features/dashboard/Dashboard.tsx` — render next moves, STAR confidence, course links.

---

## Task 1: Course-link enricher (pure helper, TDD)

**Files:**
- Create: `backend/services/analysisEnrichment.js`
- Test: `backend/test/analysisEnrichment.test.js`

- [ ] **Step 1: Write the failing test**

Create `backend/test/analysisEnrichment.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { enrichLearningRoadmap } = require('../services/analysisEnrichment');

test('enrichLearningRoadmap: adds learningLinks per roadmap item keyed on course', () => {
  const analysis = {
    personalized_learning_roadmap: [
      { course: 'SQL', platform: 'Coursera', impact: 'x' },
      { course: 'Python', platform: 'Udemy', impact: 'y' },
    ],
  };
  enrichLearningRoadmap(analysis);
  const links = analysis.personalized_learning_roadmap[0].learningLinks;
  assert.equal(Array.isArray(links), true);
  assert.equal(links.length, 2); // Udemy + Coursera
  assert.equal(links[0].provider, 'Udemy');
  assert.match(links[0].url, /udemy\.com.*SQL/i);
  assert.equal(links[1].provider, 'Coursera');
});

test('enrichLearningRoadmap: no roadmap -> analysis unchanged, no throw', () => {
  const a = { user_profile: { name: 'A' } };
  const result = enrichLearningRoadmap(a);
  assert.equal(result, a);
  assert.equal('personalized_learning_roadmap' in result, false);
});

test('enrichLearningRoadmap: empty roadmap array stays empty', () => {
  const a = { personalized_learning_roadmap: [] };
  enrichLearningRoadmap(a);
  assert.deepEqual(a.personalized_learning_roadmap, []);
});

test('enrichLearningRoadmap: item without course gets empty learningLinks', () => {
  const a = { personalized_learning_roadmap: [{ platform: 'Coursera', impact: 'z' }] };
  enrichLearningRoadmap(a);
  assert.deepEqual(a.personalized_learning_roadmap[0].learningLinks, []);
});

test('enrichLearningRoadmap: null/garbage input does not throw', () => {
  assert.equal(enrichLearningRoadmap(null), null);
  assert.equal(enrichLearningRoadmap(undefined), undefined);
  enrichLearningRoadmap({ personalized_learning_roadmap: [null, 'x', 42] });
});

test('enrichLearningRoadmap: idempotent', () => {
  const a = { personalized_learning_roadmap: [{ course: 'React' }] };
  enrichLearningRoadmap(a);
  const first = JSON.stringify(a);
  enrichLearningRoadmap(a);
  assert.equal(JSON.stringify(a), first);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && node --test test/analysisEnrichment.test.js`
Expected: FAIL — `Cannot find module '../services/analysisEnrichment'`.

- [ ] **Step 3: Write minimal implementation**

Create `backend/services/analysisEnrichment.js`:

```js
'use strict';

const courses = require('./data/courseProvider');

/**
 * Enrich each personalized_learning_roadmap item with real course search links,
 * keyed on the item's `course` field. Deterministic and idempotent: links are
 * computed in code (never by the model), so this is safe to run on both freshly
 * generated and already-saved analyses.
 *
 * Mutates and returns the same analysis object.
 *
 * @param {object} analysis
 * @returns {object}
 */
function enrichLearningRoadmap(analysis) {
  if (!analysis || typeof analysis !== 'object') return analysis;
  const roadmap = analysis.personalized_learning_roadmap;
  if (!Array.isArray(roadmap)) return analysis;

  for (const item of roadmap) {
    if (!item || typeof item !== 'object') continue;
    const skill = typeof item.course === 'string' ? item.course.trim() : '';
    item.learningLinks = skill ? courses.coursesForSkill(skill) : [];
  }
  return analysis;
}

module.exports = { enrichLearningRoadmap };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && node --test test/analysisEnrichment.test.js`
Expected: PASS — all 6 tests pass.

- [ ] **Step 5: Run the full backend suite (no regressions)**

Run: `cd backend && npm test`
Expected: PASS — existing `careerPathService`, `discoveryService`, `onetClient` tests plus the new file all pass.

- [ ] **Step 6: Commit**

```bash
git add backend/services/analysisEnrichment.js backend/test/analysisEnrichment.test.js
git commit -m "feat(analysis): add deterministic course-link enricher for learning roadmap"
```

---

## Task 2: Wire the enricher into both cvController response paths

**Files:**
- Modify: `backend/controllers/cvController.js`

- [ ] **Step 1: Import the enricher**

At the top of `backend/controllers/cvController.js`, after the existing `require` lines (the last one is `const { saveAnalysis, getLatestAnalysis } = require('../db/analyses');`), add:

```js
const { enrichLearningRoadmap } = require('../services/analysisEnrichment');
```

- [ ] **Step 2: Enrich in `analyzeCV` before persistence + response**

In `exports.analyzeCV`, the block currently reads:

```js
      // Analyze CV with OpenAI
      const analysis = await openaiService.analyzeCV(cvText);

      // Best-effort persistence: never let a DB hiccup fail the analysis response.
      const userId = getRequestUserId(req);
```

Insert the enrich call immediately after the `analyzeCV` line so the saved payload and the response both carry links:

```js
      // Analyze CV with OpenAI
      const analysis = await openaiService.analyzeCV(cvText);

      // Attach real, clickable course links (deterministic, code-side).
      enrichLearningRoadmap(analysis);

      // Best-effort persistence: never let a DB hiccup fail the analysis response.
      const userId = getRequestUserId(req);
```

- [ ] **Step 3: Enrich in `getLatestAnalysis` so already-saved analyses get links too**

In `exports.getLatestAnalysis`, change:

```js
    const analysis = await getLatestAnalysis(userId);
    return res.json({ analysis });
```

to:

```js
    const analysis = await getLatestAnalysis(userId);
    return res.json({ analysis: enrichLearningRoadmap(analysis) });
```

(`enrichLearningRoadmap` returns `null` unchanged when there's no saved analysis.)

- [ ] **Step 4: Verify the backend still boots and tests pass**

Run: `cd backend && npm test`
Expected: PASS (unchanged — this task adds no tests, but nothing should break).

Run: `cd backend && node -e "require('./controllers/cvController'); console.log('controller loads OK')"`
Expected: prints `controller loads OK` with no require errors.

- [ ] **Step 5: Commit**

```bash
git add backend/controllers/cvController.js
git commit -m "feat(analysis): enrich learning roadmap with course links on analyze + latest"
```

---

## Task 3: Make the analysis prompt directive (next_actions, grounded STAR, evidence)

**Files:**
- Modify: `backend/services/prompts/analysisPrompt.js`

No unit test (prompt is a string template; behavior is model-side). Verified structurally here and behaviorally in Task 6.

- [ ] **Step 1: Add the `next_actions` block to the JSON contract**

In `backend/services/prompts/analysisPrompt.js`, find the end of the `"analysis"` object and the start of `"role_matching"`:

```js
    "recommended_roles": ["3-5 specific job titles that match their experience and skills"]
  },
  "role_matching": [
```

Replace with (inserts `next_actions` between them):

```js
    "recommended_roles": ["3-5 specific job titles that match their experience and skills"]
  },
  "next_actions": [
    {
      "action": "An imperative, specific next step grounded in the resume (e.g., 'Add quantifiable metrics to your three most recent bullet points')",
      "why": "One sentence on the concrete payoff",
      "points_to": "Exactly one of: resume | career-paths | discovery | interviews | learning"
    }
  ],
  "role_matching": [
```

- [ ] **Step 2: Add `confidence` and `evidence_basis` to STAR stories**

Find:

```js
  "star_interview_stories": [
    {
      "title": "Brief title for the story (e.g., 'Led Marketing Campaign')",
      "situation": "Describe the situation or context.",
      "task": "What was the specific task or goal?",
      "action": "What actions did the person take?",
      "result": "What were the quantifiable results or outcomes?"
    }
  ],
```

Replace with:

```js
  "star_interview_stories": [
    {
      "title": "Brief title for the story (e.g., 'Led Marketing Campaign')",
      "situation": "Describe the situation or context.",
      "task": "What was the specific task or goal?",
      "action": "What actions did the person take?",
      "result": "What were the quantifiable results or outcomes?",
      "confidence": "high | medium | draft - how directly the resume supports this story",
      "evidence_basis": "The specific resume line or achievement this story is built on, or '' if inferred"
    }
  ],
```

- [ ] **Step 3: Add the directive instruction paragraphs**

Find the closing instructions:

```js
IMPORTANT: You MUST provide EXACTLY 3 roles in the role_matching array, each with a different role title, match percentage, and transition difficulty. Make sure each role has a detailed description, required skills, and salary range.

Ensure your response is ONLY the JSON object with no additional text before or after. Adhere strictly to the requested keys and structure.
```

Replace with:

```js
IMPORTANT: You MUST provide EXACTLY 3 roles in the role_matching array, each with a different role title, match percentage, and transition difficulty. Make sure each role has a detailed description, required skills, and salary range.

NEXT ACTIONS: Provide 3-5 items in next_actions, ordered by impact (most valuable first). Ground every action in something actually present in the resume. Keep "why" to one sentence. "points_to" MUST be exactly one of: resume, career-paths, discovery, interviews, learning.

STAR STORIES: Set "confidence" to "high" only when a concrete, quantifiable achievement in the resume backs the story. Use "draft" when the resume does not directly support a measurable result - keep that result qualitative and do NOT invent metrics, numbers, or outcomes that are not in the resume.

EVIDENCE-LINKED STRENGTHS: Phrase each item in profile_strengths.core_competencies and analysis.strengths with its supporting resume evidence inline, e.g. "Stakeholder management - led 3 cross-functional product launches." Do not assert a strength the resume does not support.

Ensure your response is ONLY the JSON object with no additional text before or after. Adhere strictly to the requested keys and structure.
```

- [ ] **Step 4: Verify the template still loads and is valid JS**

Run: `cd backend && node -e "const p = require('./services/prompts/analysisPrompt'); const s = p('SAMPLE CV'); console.log(s.includes('next_actions') && s.includes('evidence_basis') ? 'prompt OK' : 'MISSING FIELDS')"`
Expected: prints `prompt OK`.

- [ ] **Step 5: Commit**

```bash
git add backend/services/prompts/analysisPrompt.js
git commit -m "feat(analysis): make CV prompt directive (next_actions, grounded STAR, evidence)"
```

---

## Task 4: Extend frontend types

**Files:**
- Modify: `clerk-react/src/types/analysis.ts`

- [ ] **Step 1: Add `next_actions` to `CvAnalysis`**

In `clerk-react/src/types/analysis.ts`, find:

```ts
  analysis?: AnalysisDetails;
  archetype?: ArchetypeData | null;
```

Replace with:

```ts
  analysis?: AnalysisDetails;
  next_actions?: { action: string; why: string; points_to: string }[];
  archetype?: ArchetypeData | null;
```

- [ ] **Step 2: Add `confidence` + `evidence_basis` to STAR story items**

Find:

```ts
  star_interview_stories?: {
    title?: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  }[];
```

Replace with:

```ts
  star_interview_stories?: {
    title?: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    confidence?: 'high' | 'medium' | 'draft';
    evidence_basis?: string;
  }[];
```

- [ ] **Step 3: Add `learningLinks` to roadmap items**

Find:

```ts
  personalized_learning_roadmap?: {
    course: string;
    platform: string;
    impact: string;
    difficulty?: string;
    duration?: string;
  }[];
```

Replace with:

```ts
  personalized_learning_roadmap?: {
    course: string;
    platform: string;
    impact: string;
    difficulty?: string;
    duration?: string;
    learningLinks?: { provider: string; title: string; url: string }[];
  }[];
```

- [ ] **Step 4: Typecheck**

Run: `cd clerk-react && npm run build`
Expected: PASS — `tsc -b` reports no errors and Vite builds. (No usages broken; all additions are optional.)

- [ ] **Step 5: Commit**

```bash
git add clerk-react/src/types/analysis.ts
git commit -m "feat(types): add next_actions, STAR confidence, and roadmap learningLinks"
```

---

## Task 5: Render the new content on the Dashboard

**Files:**
- Modify: `clerk-react/src/features/dashboard/Dashboard.tsx`

- [ ] **Step 1: Add the `ListChecks` icon to the lucide import**

Find the import block:

```tsx
import {
  Award,
  Briefcase,
  FileText,
  TrendingUp,
  BookOpen,
  Target,
  Upload,
  Lightbulb,
  MessageSquare,
  Rocket,
  Loader2,
} from 'lucide-react';
```

Replace with (adds `ListChecks`):

```tsx
import {
  Award,
  Briefcase,
  FileText,
  TrendingUp,
  BookOpen,
  Target,
  Upload,
  Lightbulb,
  MessageSquare,
  Rocket,
  ListChecks,
  Loader2,
} from 'lucide-react';
```

- [ ] **Step 2: Add module-scope helpers (route mapping + confidence badge)**

In `clerk-react/src/features/dashboard/Dashboard.tsx`, find the `Pill` component definition:

```tsx
const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">{children}</span>
);
```

Insert immediately **after** it:

```tsx
// Map a next-action's points_to to an in-app route. 'resume' and 'learning' are
// sections on this same Dashboard page, so they get no navigation button.
function routeForPointsTo(pointsTo?: string): string | null {
  switch (pointsTo) {
    case 'career-paths':
      return '/career-paths';
    case 'discovery':
      return '/discovery';
    case 'interviews':
      return '/interviews';
    default:
      return null;
  }
}

const ConfidenceBadge: React.FC<{ confidence: 'high' | 'medium' | 'draft' }> = ({ confidence }) => {
  const styles: Record<string, string> = {
    high: 'bg-green-50 text-green-700',
    medium: 'bg-blue-50 text-blue-700',
    draft: 'bg-amber-50 text-amber-700',
  };
  const label =
    confidence === 'draft' ? 'Draft' : confidence === 'high' ? 'Well-evidenced' : 'Partly evidenced';
  return <span className={`text-xs px-2 py-1 rounded-full ${styles[confidence]}`}>{label}</span>;
};
```

- [ ] **Step 3: Render the "Your Next Moves" card**

Find the recruiter summary block (it ends just before the Profile section):

```tsx
      {analysis.recruiter_friendly_summary && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 mb-6">
          <p className="text-lg leading-relaxed">{analysis.recruiter_friendly_summary}</p>
        </div>
      )}
```

Insert immediately **after** that block:

```tsx
      {analysis.next_actions && analysis.next_actions.length > 0 && (
        <Section title="Your Next Moves" icon={<ListChecks size={20} />}>
          <ol className="space-y-3">
            {analysis.next_actions.map((a, i) => {
              const route = routeForPointsTo(a.points_to);
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{a.action}</p>
                    {a.why && <p className="text-gray-600 text-sm">{a.why}</p>}
                    {route && (
                      <button
                        onClick={() => navigate(route)}
                        className="mt-1 text-sm font-medium text-blue-700 hover:text-blue-800"
                      >
                        Go &rarr;
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>
      )}
```

- [ ] **Step 4: Render course links inside each roadmap item**

Find the roadmap item body:

```tsx
                {item.impact && <p className="text-gray-600 text-sm mt-1">{item.impact}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {item.difficulty && <span>{item.difficulty}</span>}
                  {item.duration && <span>{item.duration}</span>}
                </div>
```

Replace with (adds the links row after difficulty/duration):

```tsx
                {item.impact && <p className="text-gray-600 text-sm mt-1">{item.impact}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {item.difficulty && <span>{item.difficulty}</span>}
                  {item.duration && <span>{item.duration}</span>}
                </div>
                {item.learningLinks && item.learningLinks.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {item.learningLinks.map((link, j) => (
                      <a
                        key={j}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-700 hover:text-blue-800 underline"
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>
                )}
```

- [ ] **Step 5: Render the STAR confidence badge + draft note**

Find the STAR story card header:

```tsx
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                {story.title && <h4 className="font-semibold text-gray-800 mb-2">{story.title}</h4>}
                <dl className="space-y-1 text-sm">
```

Replace with:

```tsx
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  {story.title && <h4 className="font-semibold text-gray-800">{story.title}</h4>}
                  {story.confidence && <ConfidenceBadge confidence={story.confidence} />}
                </div>
                {story.confidence === 'draft' && (
                  <p className="text-xs text-amber-600 mb-2">
                    Starting point &mdash; refine this with your own details.
                  </p>
                )}
                <dl className="space-y-1 text-sm">
```

- [ ] **Step 6: Typecheck + build**

Run: `cd clerk-react && npm run build`
Expected: PASS — `tsc -b` reports no errors (note strict `noUnusedLocals`: `ListChecks`, `routeForPointsTo`, and `ConfidenceBadge` are all now used) and Vite builds.

- [ ] **Step 7: Commit**

```bash
git add clerk-react/src/features/dashboard/Dashboard.tsx
git commit -m "feat(dashboard): render next moves, STAR confidence, and course links"
```

---

## Task 6: End-to-end verification

**Files:** none (verification only).

Auth is paused locally (`AUTH_ENABLED=false` backend, `VITE_AUTH_ENABLED=false` frontend), so the upload flow works without sign-in. Confirm both env files reflect that before starting.

- [ ] **Step 1: Start the backend**

Run: `cd backend && npm run dev`
Expected: server listens on port 5001; `GET http://localhost:5001/health` returns `{"status":"ok"}`.

- [ ] **Step 2: Start the frontend**

Run (separate shell): `cd clerk-react && npm run dev`
Expected: Vite serves on port 3000.

- [ ] **Step 3: Upload a sample CV and inspect the Dashboard**

Use a real PDF/DOCX CV at `/upload`. After analysis routes to `/dashboard`, confirm:
- A **"Your Next Moves"** card appears near the top with 3–5 numbered actions; actions pointing to career-paths/discovery/interviews show a working **Go →** button.
- **Interview Stories (STAR)** cards show a confidence badge; any `draft` story shows the amber "starting point" note and no fabricated metrics.
- **Learning Roadmap** items show clickable **"Browse … courses on Udemy/Coursera"** links that open the right search page.

- [ ] **Step 4: Verify backward compatibility (already-saved analysis gets links)**

Reload `/dashboard` (no upload) so it fetches `GET /analyses/latest`. Confirm the previously-saved analysis still renders fully and its roadmap items now show course links (added at read time by `enrichLearningRoadmap`). Older analyses simply won't have a Next Moves card or STAR badges — that's expected and must not error.

- [ ] **Step 5: Final full-suite check**

Run: `cd backend && npm test`
Expected: PASS.
Run: `cd clerk-react && npm run build`
Expected: PASS.

- [ ] **Step 6 (optional): squash/cleanup is not needed** — each task committed independently on the `course-provider` branch. Open a PR when ready.

---

## Self-Review (completed)

- **Spec coverage:** next_actions (Tasks 3, 4, 5) ✓; grounded STAR confidence/evidence (Tasks 3, 4, 5) ✓; evidence-linked strengths instruction (Task 3) ✓; real course links via `enrichLearningRoadmap` in both controller paths (Tasks 1, 2, 5) ✓; optional/backward-compatible types (Task 4) ✓; backend unit test + verification (Tasks 1, 6) ✓.
- **Placeholder scan:** none — every code step shows complete content.
- **Type consistency:** `enrichLearningRoadmap` signature identical across Tasks 1/2; `learningLinks` shape `{ provider, title, url }[]` matches `courseProvider.coursesForSkill` output and the TS type in Task 4; `confidence` union `'high' | 'medium' | 'draft'` matches between Task 4 type and Task 5 `ConfidenceBadge`; `points_to` strings match between Task 3 prompt and Task 5 `routeForPointsTo`.
