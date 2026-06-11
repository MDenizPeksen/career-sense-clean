# Course Provider for Career Paths — Design Spec

**Date:** 2026-06-10
**Status:** Approved
**Branch:** `course-provider` (off `main`)

---

## Problem

The Career Paths page shows skill gaps grounded in O*NET data but gives the user
nothing actionable to do about them. The `topSkillGaps` banner says "Highest-leverage
skills to learn" with no links. This spec adds real, clickable learning links per
skill — no invented course names or prices, no API keys required.

---

## Decision context

- **Provider architecture:** Search-link provider with `isConfigured()`/fallback
  abstraction — mirrors `onetClient`. Default = deep links to Udemy/Coursera search
  queries per skill gap. Zero network calls, no API key needed now; a real course API
  (e.g. Udemy Affiliate) slots in later behind `isConfigured()`.
- **Surface:** Enrich the aggregated `topSkillGaps` only (8 skills, already computed).
  Ephemeral — computed on the existing `GET /api/career-paths` endpoint; no DB
  persistence for v1.
- **No invention:** URL builders are deterministic and produce real search-result pages.
  Titles are generic ("Browse \<skill\> courses on Udemy"). No fabricated ratings,
  prices, or course names.

---

## 1. Backend — `backend/services/data/courseProvider.js`

A pure module (no I/O, fully unit-testable) that builds search-page deep-links.

### Interface

```js
const isConfigured = () => false;   // always false until a real API is wired

/**
 * @param {string} skill
 * @returns {{ provider: string, title: string, url: string }[]}
 */
function coursesForSkill(skill) { ... }

module.exports = { isConfigured, coursesForSkill };
```

### Search-link builder

`coursesForSkill(skill)` returns 2 links — one Udemy, one Coursera:

| Provider | URL template |
|----------|-------------|
| Udemy    | `https://www.udemy.com/courses/search/?q=<encoded>` |
| Coursera | `https://www.coursera.org/search?query=<encoded>` |

- Skill is `encodeURIComponent`-encoded.
- Title: `"Browse ${skill} courses on ${Provider}"`.
- No network calls, no try/catch needed.

### Future-proofing

When a real API key is added, `isConfigured()` returns `true` and
`coursesForSkill` fetches real courses. `careerPathService.js` uses only the
public interface — callers don't change.

---

## 2. Backend — `careerPathService.js` enrichment

Add one field to the `getCareerPaths` return value. Leave `topSkillGaps: string[]`
**untouched** (avoids breaking existing consumers).

### New field

```js
learningLinks: [
  {
    skill: string,
    courses: [{ provider: string, title: string, url: string }]
  }
]
```

### Computation

At the end of `getCareerPaths`, after `aggregateTopGaps`:

```js
const courses = require('./data/courseProvider');
// ...
const learningLinks = topSkillGaps.map((skill) => ({
  skill,
  courses: courses.coursesForSkill(skill),
}));
return { ..., topSkillGaps, learningLinks, ... };
```

`learningLinks` is `[]` when `topSkillGaps` is empty (all paths: `source:'none'`,
`source:'onet'` with no gaps, `source:'analysis'` with no gaps).

---

## 3. Frontend — type + UI

### `clerk-react/src/types/careerPaths.ts`

Add to `CareerPathsResult`:

```ts
export interface CourseLink {
  provider: string;
  title: string;
  url: string;
}

export interface LearningLink {
  skill: string;
  courses: CourseLink[];
}

// In CareerPathsResult:
learningLinks?: LearningLink[];
```

Optional (`?`) so existing cached / older API responses don't break.

### `clerk-react/src/features/career-paths/CareerPaths.tsx`

Extend the existing "Highest-leverage skills to learn" banner. Today it renders
skill chips. After this change, each chip becomes a skill name + a row of small
"Learn →" provider links.

**Mockup (prose):**

```
╔══════════════════════════════════════════════════╗
║ ↑ Highest-leverage skills to learn               ║
║   These show up most across your matching roles  ║
║                                                  ║
║  [Python]  Learn on Udemy  ·  Learn on Coursera  ║
║  [SQL]     Learn on Udemy  ·  Learn on Coursera  ║
║  …                                               ║
╚══════════════════════════════════════════════════╝
```

- Skill name rendered as a label (not a standalone chip anymore).
- Provider links are anchor tags with `target="_blank" rel="noopener noreferrer"`.
- Icon: `ExternalLink` (14px, lucide-react) inline with each link.
- If `learningLinks` is absent or empty, the banner falls back to the current
  chip-only rendering (backward-compat guard).

---

## 4. Testing

### New: `backend/test/courseProvider.test.js`

Unit tests (node:test, no I/O):
- URL encoding: spaces → `%20`, `+` preserved (e.g. "C++").
- Returns exactly 2 links per skill (Udemy + Coursera).
- Titles contain the skill name.
- Empty string input returns 2 links with empty query (graceful, not a crash).

### Extend: `backend/test/careerPathService.test.js`

- `getCareerPaths` result includes `learningLinks` matching `topSkillGaps`.
- `learningLinks` is `[]` when `topSkillGaps` is `[]`.
- Existing 11 tests remain green.

---

## 5. What's explicitly out of scope

- `RoadmapItem` / DB persistence — belongs with Phase F.
- Dashboard AI roadmap replacement — separate task.
- Per-transition course lists — deferred (enriching aggregated gaps is sufficient for v1).
- Filtering/ranking courses — meaningless until a real API supplies metadata.
- YouTube / edX providers — can be added later by extending the link builder array.
- Status tracking or "mark complete" — Phase F.

---

## Affected files

| File | Change |
|------|--------|
| `backend/services/data/courseProvider.js` | New |
| `backend/services/careerPathService.js` | Add `learningLinks` to return value |
| `backend/test/courseProvider.test.js` | New |
| `backend/test/careerPathService.test.js` | Extend with `learningLinks` assertions |
| `clerk-react/src/types/careerPaths.ts` | Add `CourseLink`, `LearningLink`, `learningLinks?` |
| `clerk-react/src/features/career-paths/CareerPaths.tsx` | Enrich top-gaps banner with links |

No new routes, no DB migrations, no new environment variables.
