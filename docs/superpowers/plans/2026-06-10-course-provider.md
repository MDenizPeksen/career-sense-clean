# Course Provider for Career Paths — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real Udemy + Coursera search links to each top skill gap on the Career Paths page — no API keys, no invented data, backward-compatible.

**Architecture:** A pure `courseProvider.js` module (mirrors `onetClient`'s shape) builds deterministic search-page URLs. `careerPathService.js` gains a pure `buildLearningLinks` helper that maps `topSkillGaps → learningLinks` and includes the result in the `getCareerPaths` return. The frontend type gets an optional `learningLinks?` field; the Career Paths top-gaps banner renders skill rows with clickable provider links.

**Tech Stack:** Node.js (CommonJS), node:test + assert/strict, TypeScript (strict), React 19, Tailwind CSS, lucide-react.

---

## File map

| Path | Action | Responsibility |
|------|--------|----------------|
| `backend/services/data/courseProvider.js` | Create | Pure URL builder — `isConfigured()` + `coursesForSkill(skill)` |
| `backend/services/careerPathService.js` | Modify | Add `require('./data/courseProvider')`, `buildLearningLinks` pure helper, `learningLinks` in return value, export `buildLearningLinks` |
| `backend/test/courseProvider.test.js` | Create | Unit tests for the URL builder |
| `backend/test/careerPathService.test.js` | Modify | Two new tests for `buildLearningLinks` |
| `clerk-react/src/types/careerPaths.ts` | Modify | Add `CourseLink`, `LearningLink`, `learningLinks?` to `CareerPathsResult` |
| `clerk-react/src/features/career-paths/CareerPaths.tsx` | Modify | Render per-skill course links in the top-gaps banner |

---

## Task 1 — `courseProvider.js`: write failing tests

**Files:**
- Create: `backend/test/courseProvider.test.js`

- [ ] **Step 1: Create the test file**

```js
// backend/test/courseProvider.test.js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { isConfigured, coursesForSkill } = require('../services/data/courseProvider');

test('isConfigured: always returns false (no real API wired yet)', () => {
  assert.equal(isConfigured(), false);
});

test('coursesForSkill: returns exactly 2 links (Udemy + Coursera)', () => {
  const links = coursesForSkill('Python');
  assert.equal(links.length, 2);
  const providers = links.map((l) => l.provider);
  assert.ok(providers.includes('Udemy'));
  assert.ok(providers.includes('Coursera'));
});

test('coursesForSkill: URL contains percent-encoded skill name', () => {
  const links = coursesForSkill('Machine Learning');
  for (const { url } of links) {
    assert.ok(url.includes('Machine%20Learning'), `URL should encode spaces: ${url}`);
  }
});

test('coursesForSkill: encodes C++ correctly', () => {
  const links = coursesForSkill('C++');
  for (const { url } of links) {
    assert.ok(url.includes('C%2B%2B'), `URL should encode +: ${url}`);
  }
});

test('coursesForSkill: title contains skill name and provider name', () => {
  const links = coursesForSkill('SQL');
  for (const { title, provider } of links) {
    assert.ok(title.includes('SQL'), `title should contain skill: ${title}`);
    assert.ok(title.includes(provider), `title should contain provider name: ${title}`);
  }
});

test('coursesForSkill: empty string returns 2 links without crashing', () => {
  const links = coursesForSkill('');
  assert.equal(links.length, 2);
  for (const { url, title } of links) {
    assert.equal(typeof url, 'string');
    assert.equal(typeof title, 'string');
  }
});
```

- [ ] **Step 2: Run tests — expect MODULE NOT FOUND failure**

```bash
cd backend && node --test test/courseProvider.test.js
```

Expected: `Error: Cannot find module '../services/data/courseProvider'`

---

## Task 2 — `courseProvider.js`: implement

**Files:**
- Create: `backend/services/data/courseProvider.js`

- [ ] **Step 3: Create the module**

```js
// backend/services/data/courseProvider.js
'use strict';

/**
 * Course-link provider for skill gaps.
 *
 * Default implementation: generates deep search-page links (Udemy, Coursera).
 * No network calls, no API key required. isConfigured() always returns false
 * until a real course API is wired behind it.
 *
 * Mirrors the onetClient shape (isConfigured / main function) so a real
 * provider can be swapped in without touching callers.
 */

const PROVIDERS = [
  {
    name: 'Udemy',
    buildUrl: (skill) =>
      `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`,
  },
  {
    name: 'Coursera',
    buildUrl: (skill) =>
      `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
  },
];

const isConfigured = () => false;

/**
 * Return course search links for a skill.
 * @param {string} skill
 * @returns {{ provider: string, title: string, url: string }[]}
 */
function coursesForSkill(skill) {
  return PROVIDERS.map(({ name, buildUrl }) => ({
    provider: name,
    title: `Browse ${skill} courses on ${name}`,
    url: buildUrl(skill),
  }));
}

module.exports = { isConfigured, coursesForSkill };
```

- [ ] **Step 4: Run tests — expect all 6 to pass**

```bash
cd backend && node --test test/courseProvider.test.js
```

Expected output: `▶ courseProvider` … `6 pass, 0 fail`

- [ ] **Step 5: Commit**

```bash
cd backend && git add services/data/courseProvider.js test/courseProvider.test.js
git commit -m "feat: add courseProvider — Udemy/Coursera search-link builder"
```

---

## Task 3 — `careerPathService.js`: write failing tests

**Files:**
- Modify: `backend/test/careerPathService.test.js` (add 2 tests at the bottom)

- [ ] **Step 6: Add `buildLearningLinks` to the require line and append 2 tests**

Open `backend/test/careerPathService.test.js`. Change the destructure on line 6 to:

```js
const {
  normalizeSkill,
  dedupeSkills,
  computeSkillGap,
  collectUserSkills,
  buildTransitionsFromAnalysis,
  aggregateTopGaps,
  buildLearningLinks,
} = require('../services/careerPathService');
```

Then append at the end of the file:

```js
test('buildLearningLinks: maps skills → learningLinks with Udemy + Coursera entries', () => {
  const links = buildLearningLinks(['Python', 'SQL']);
  assert.equal(links.length, 2);
  assert.equal(links[0].skill, 'Python');
  assert.equal(links[1].skill, 'SQL');
  // Each skill has 2 courses
  assert.equal(links[0].courses.length, 2);
  const providers = links[0].courses.map((c) => c.provider);
  assert.ok(providers.includes('Udemy'));
  assert.ok(providers.includes('Coursera'));
  // Each course has string url + title
  for (const c of links[0].courses) {
    assert.equal(typeof c.url, 'string');
    assert.equal(typeof c.title, 'string');
    assert.ok(c.url.startsWith('http'));
  }
});

test('buildLearningLinks: returns [] for empty input', () => {
  assert.deepEqual(buildLearningLinks([]), []);
});
```

- [ ] **Step 7: Run — expect the 2 new tests to fail**

```bash
cd backend && node --test test/careerPathService.test.js
```

Expected: `TypeError: buildLearningLinks is not a function` (or similar — `buildLearningLinks` doesn't exist yet).

---

## Task 4 — `careerPathService.js`: implement enrichment

**Files:**
- Modify: `backend/services/careerPathService.js`

- [ ] **Step 8: Add the `courseProvider` require at the top of the file**

After the existing requires (lines 17-19), add:

```js
const courses = require('./data/courseProvider');
```

- [ ] **Step 9: Add `buildLearningLinks` pure helper after `aggregateTopGaps`**

Insert this function immediately after `aggregateTopGaps` (before the `// ---- Orchestrator` comment):

```js
/**
 * Build learning links for a list of skill gaps.
 * @param {string[]} topSkillGaps
 * @returns {Array<{ skill: string, courses: Array<{ provider: string, title: string, url: string }> }>}
 */
function buildLearningLinks(topSkillGaps) {
  return (topSkillGaps || []).map((skill) => ({
    skill,
    courses: courses.coursesForSkill(skill),
  }));
}
```

- [ ] **Step 10: Add `learningLinks` to the `getCareerPaths` return values**

There are two return statements in `getCareerPaths`. Both need `learningLinks`.

**First return** (the early-exit `source:'none'` path, around line 181):

```js
  if (!analysis) {
    return {
      source: 'none',
      onetConfigured: onet.isConfigured(),
      currentRole: null,
      transitions: [],
      topSkillGaps: [],
      learningLinks: [],
      generatedAt,
      message: 'Upload and analyze your CV first to see career paths.',
    };
  }
```

**Second return** (the main path, at the end of the function):

```js
  return {
    source,
    onetConfigured: onet.isConfigured(),
    currentRole,
    transitions,
    topSkillGaps: aggregateTopGaps(transitions),
    learningLinks: buildLearningLinks(aggregateTopGaps(transitions)),
    generatedAt,
  };
```

> Note: `aggregateTopGaps(transitions)` is called twice to avoid an intermediate variable — this is fine since it's pure and fast. Alternatively extract to a local `const topSkillGaps = aggregateTopGaps(transitions)` first.

The cleaner version with a local variable:

```js
  const topSkillGaps = aggregateTopGaps(transitions);
  return {
    source,
    onetConfigured: onet.isConfigured(),
    currentRole,
    transitions,
    topSkillGaps,
    learningLinks: buildLearningLinks(topSkillGaps),
    generatedAt,
  };
```

- [ ] **Step 11: Export `buildLearningLinks`**

At the bottom of the file, add `buildLearningLinks` to `module.exports`:

```js
module.exports = {
  getCareerPaths,
  // Exported for unit testing:
  normalizeSkill,
  dedupeSkills,
  computeSkillGap,
  collectUserSkills,
  buildTransitionsFromAnalysis,
  aggregateTopGaps,
  buildLearningLinks,
};
```

- [ ] **Step 12: Run the full backend test suite — expect all 34 tests to pass**

```bash
cd backend && node --test test/*.test.js
```

Expected: `34 pass, 0 fail` (32 existing + 2 new `buildLearningLinks` tests).

- [ ] **Step 13: Commit**

```bash
git add backend/services/careerPathService.js backend/test/careerPathService.test.js
git commit -m "feat: enrich getCareerPaths with learningLinks per top skill gap"
```

---

## Task 5 — Frontend types

**Files:**
- Modify: `clerk-react/src/types/careerPaths.ts`

- [ ] **Step 14: Add the new types**

Add `CourseLink` and `LearningLink` interfaces, and extend `CareerPathsResult`. The full updated file:

```ts
// Contract for the Career Paths feature (/api/career-paths).
// The backend computes data-grounded role-shift options + skill gaps from the
// user's saved analysis (and discovery profile), grounded in O*NET when configured.

export type CareerPathSource = 'onet' | 'analysis' | 'none';

export interface CareerTransition {
  title: string;
  code: string | null; // O*NET-SOC code when grounded
  matchPercentage: number | null;
  difficulty: string | null;
  description: string;
  salaryRange: string | null;
  requiredSkills: string[];
  sharedSkills: string[]; // skills the user already has
  skillGap: string[]; // skills the user still needs
}

export interface CourseLink {
  provider: string;
  title: string;
  url: string;
}

export interface LearningLink {
  skill: string;
  courses: CourseLink[];
}

export interface CareerPathsResult {
  source: CareerPathSource;
  onetConfigured: boolean;
  currentRole: string | null;
  transitions: CareerTransition[];
  topSkillGaps: string[];
  learningLinks?: LearningLink[]; // optional: absent in older cached responses
  generatedAt: string;
  message?: string;
}
```

- [ ] **Step 15: Verify the build still compiles**

```bash
cd clerk-react && npm run build
```

Expected: build succeeds with no TS errors (types are additive, nothing consumed yet).

- [ ] **Step 16: Commit**

```bash
git add clerk-react/src/types/careerPaths.ts
git commit -m "feat: add CourseLink + LearningLink types to careerPaths contract"
```

---

## Task 6 — Frontend UI: render learning links in the top-gaps banner

**Files:**
- Modify: `clerk-react/src/features/career-paths/CareerPaths.tsx`

- [ ] **Step 17: Add `ExternalLink` to the lucide-react import**

Find the existing lucide-react import at the top of `CareerPaths.tsx` and add `ExternalLink`:

```ts
import {
  Route as RouteIcon,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Target,
  Database,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
```

- [ ] **Step 18: Add the `LearningLink` type to the import**

Find the type import line:

```ts
import type { CareerPathsResult, CareerTransition } from '../../types/careerPaths';
```

Change it to:

```ts
import type { CareerPathsResult, CareerTransition, LearningLink } from '../../types/careerPaths';
```

- [ ] **Step 19: Replace the top-gaps banner content**

Find the existing banner block (around line 194–215):

```tsx
{data.topSkillGaps.length > 0 && (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-8">
    <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
      <TrendingUp size={18} className="text-blue-600" />
      Highest-leverage skills to learn
    </p>
    <p className="text-sm text-gray-600 mb-3">
      These show up most across your matching roles — learning them opens the most
      doors.
    </p>
    <div className="flex flex-wrap gap-2">
      {data.topSkillGaps.map((s) => (
        <span
          key={s}
          className="text-sm font-medium px-3 py-1.5 rounded-full bg-white text-blue-700 border border-blue-200"
        >
          {s}
        </span>
      ))}
    </div>
  </div>
)}
```

Replace it with:

```tsx
{data.topSkillGaps.length > 0 && (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-8">
    <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
      <TrendingUp size={18} className="text-blue-600" />
      Highest-leverage skills to learn
    </p>
    <p className="text-sm text-gray-600 mb-3">
      These show up most across your matching roles — learning them opens the most
      doors.
    </p>
    {data.learningLinks && data.learningLinks.length > 0 ? (
      <div className="flex flex-col gap-3">
        {data.learningLinks.map(({ skill, courses }: LearningLink) => (
          <div key={skill} className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-800 w-36 shrink-0">{skill}</span>
            {courses.map(({ provider, title, url }) => (
              <a
                key={provider}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                {provider}
                <ExternalLink size={11} />
              </a>
            ))}
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-wrap gap-2">
        {data.topSkillGaps.map((s) => (
          <span
            key={s}
            className="text-sm font-medium px-3 py-1.5 rounded-full bg-white text-blue-700 border border-blue-200"
          >
            {s}
          </span>
        ))}
      </div>
    )}
  </div>
)}
```

- [ ] **Step 20: Run the TypeScript build**

```bash
cd clerk-react && npm run build
```

Expected: clean build, no TS errors. The `LearningLink` destructure uses the type we just added; the `?` on `learningLinks` means the fallback path handles the absent case.

- [ ] **Step 21: Commit**

```bash
git add clerk-react/src/features/career-paths/CareerPaths.tsx clerk-react/src/types/careerPaths.ts
git commit -m "feat: show Udemy + Coursera links per top skill gap in Career Paths"
```

---

## Task 7 — End-to-end smoke test

- [ ] **Step 22: Start both servers**

```bash
# Terminal 1
cd backend && npm run dev   # should print: Server listening on port 5001

# Terminal 2
cd clerk-react && npm run dev   # Vite on http://localhost:3000
```

- [ ] **Step 23: Verify the API response**

```bash
curl -s http://localhost:5001/api/career-paths \
  -H "Authorization: Bearer dev" | \
  node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); const r=JSON.parse(d); console.log('learningLinks count:', r.learningLinks?.length); console.log('first:', JSON.stringify(r.learningLinks?.[0], null, 2));"
```

Expected: `learningLinks count: N` (≥ 1 when a CV is seeded) and the first entry shows `skill`, `courses` with Udemy + Coursera entries.

- [ ] **Step 24: Verify the UI**

Open http://localhost:3000/career-paths. In the "Highest-leverage skills to learn" banner you should see rows like:

```
Python       [Udemy ↗]  [Coursera ↗]
SQL          [Udemy ↗]  [Coursera ↗]
…
```

Click one link — it should open the correct Udemy or Coursera search page in a new tab.

- [ ] **Step 25: Run the full test suite one last time**

```bash
cd backend && node --test test/*.test.js
```

Expected: `34 pass, 0 fail`.

- [ ] **Step 26: Final commit and push**

```bash
git push -u origin course-provider
```

Then open a PR: `course-provider` → `main`.

---

## Self-review notes

- All spec requirements covered: `courseProvider.js` (pure, `isConfigured`/`coursesForSkill`), `careerPathService` enrichment (`buildLearningLinks`, exported for tests), frontend type (`CourseLink`, `LearningLink`, optional `learningLinks?`), UI (per-skill provider rows with fallback to chip-only).
- No placeholders. All code blocks are complete.
- Type names are consistent across tasks 5 and 6 (`LearningLink`, `CourseLink`).
- Backward-compat guard (`learningLinks && learningLinks.length > 0`) ensures older API responses (without the field) fall back to chip-only rendering.
- Out-of-scope items (DB persistence, per-transition links, Dashboard roadmap) not touched.
