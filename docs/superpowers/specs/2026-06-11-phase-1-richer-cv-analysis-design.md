# Phase 1 — Richer, Directive CV Analysis (design)

> Status: approved design, ready for implementation planning.
> Roadmap context: `docs/PRODUCT_OVERVIEW.md` §9, Phase 1 (the first build increment).
> Date: 2026-06-11.

## Context / problem

The CV analysis is the **root of CareerSense's knowledge base** — every downstream
feature hangs off the `Analysis` payload. Today that analysis is *descriptive, not
directive*: it tells users **about** themselves but rarely tells them **what to do
next**. Three concrete weaknesses in `backend/services/prompts/analysisPrompt.js`:

1. **No "next actions."** Users get ten sections but no ranked guidance on what to
   do first.
2. **STAR stories are asserted as fact** even when the CV doesn't support a
   quantifiable result — a fabrication risk that violates the "never fabricate"
   rule in `CLAUDE.md`.
3. **The learning roadmap has no real links** — each item carries an AI-invented
   `platform` string (e.g. "Coursera") but nothing clickable.

Phase 1 raises the floor at the root and delivers the product's "real courses /
real insights" promise, with four high-confidence, evidence-grounded changes.

**Explicitly out of scope:** the archetype / personality model. Deriving a Jungian
or MBTI-style personality type from a CV has low validity and would be fabrication;
that work is deferred to a separate Discovery-fed exploration. Today's loose
`archetype` block is left untouched.

## Goals — done when

- Dashboard shows a ranked **"Your next moves"** list.
- STAR stories carry a **confidence badge**; `draft` ones read as "a starting point
  to refine," not asserted fact.
- Strengths read as **evidence-linked** (traceable to a CV fact).
- Each learning-roadmap item shows **clickable Udemy/Coursera links**.
- **Backward compatible:** analyses saved before this change (no new fields) still
  render cleanly, and pick up course links on read.

## Non-goals

- Archetype taxonomy / personality model (separate later exploration).
- Intent routing and the `UserContext` assembler (Phase 2).
- Restructuring `role_matching` or `resume_optimization`.

## Changes

### 1. Prompt — add `next_actions` (`backend/services/prompts/analysisPrompt.js`)

New top-level array in the JSON contract, 3–5 items, ranked by impact:

```json
"next_actions": [
  {
    "action": "Imperative next step (e.g., 'Add metrics to your top 3 résumé bullets')",
    "why": "One sentence on the payoff",
    "points_to": "resume | career-paths | discovery | interviews | learning"
  }
]
```

Instruction text: order by impact (most valuable first), ground each action in
something actually observed in the CV, cap at 3–5, keep `why` to one sentence.

### 2. Prompt — ground STAR stories (`analysisPrompt.js`)

Add two fields to each `star_interview_stories` item:

```json
{
  "title": "...", "situation": "...", "task": "...", "action": "...", "result": "...",
  "confidence": "high | medium | draft",
  "evidence_basis": "The CV line/achievement this is built on, or '' if inferred"
}
```

Instruction text: use `draft` whenever the CV does not directly support a
quantifiable result; **never invent metrics** — keep the result qualitative and
mark it `draft`. `high` only when a concrete achievement in the CV backs it.

### 3. Prompt — evidence-linked strengths (`analysisPrompt.js`)

**Instruction-only change, no schema change** (lowest risk; the UI already renders
strengths as strings). Instruct the model to phrase each `profile_strengths.core_competencies`
and `analysis.strengths` item with its CV basis inline, e.g. *"Stakeholder
management — led 3 cross-functional product launches."* Keeps the existing
`string[]` shape so no frontend type change is needed for this item.

### 4. Course links in the roadmap (deterministic, in code — no model involvement)

New helper module `backend/services/analysisEnrichment.js`:

```js
const courses = require('./data/courseProvider');
// Adds learningLinks to each roadmap item, keyed on item.course. Defensive:
// missing/empty roadmap or missing item.course are skipped. Idempotent.
function enrichLearningRoadmap(analysis) { /* ... */ return analysis; }
module.exports = { enrichLearningRoadmap };
```

Each item gains:
`learningLinks: courseProvider.coursesForSkill(item.course)` →
`{ provider, title, url }[]` (mirrors `careerPathService.js:147`).

Call it in **both** response paths in `backend/controllers/cvController.js`:
- `analyzeCV` — enrich the `analysis` object before `res.json(analysis)` (so the
  saved payload and the response both carry links).
- `getLatestAnalysis` — enrich before returning (so **already-saved** analyses get
  links too, since enrichment is deterministic and idempotent).

This keeps links out of the model (no fabrication) and covers old + new data with
one code path.

### 5. Frontend types (`clerk-react/src/types/analysis.ts`)

All additions optional → backward compatible:
- New `next_actions?: { action: string; why: string; points_to: string }[]` on `CvAnalysis`.
- `star_interview_stories` item: add `confidence?: 'high' | 'medium' | 'draft'` and `evidence_basis?: string`.
- `personalized_learning_roadmap` item: add `learningLinks?: { provider: string; title: string; url: string }[]`.

### 6. Frontend rendering (`clerk-react/src/features/dashboard/Dashboard.tsx`)

- **"Your next moves" card** near the top: render `next_actions` in rank order;
  each action's CTA routes to its `points_to` destination (map to the existing
  routes: resume→dashboard section, career-paths→`/career-paths`,
  discovery→`/discovery`, interviews→`/interviews`, learning→roadmap section).
- **STAR cards:** show a confidence badge; style `draft` distinctly with a
  "starting point — refine this" note.
- **Learning roadmap:** render `learningLinks` as clickable buttons (reuse the
  Career Paths link styling), replacing the dead `platform` string.

Guard every new field (analyses may lack them) — render nothing when absent.

## Verification

- **Backend unit test** (`backend/test/`, `node:test`): `enrichLearningRoadmap`
  adds `learningLinks` deterministically and is defensive (no roadmap, empty array,
  item without `course` → no throw; idempotent on re-run).
- **Build/typecheck:** `cd clerk-react && npm run build` (strict TS) passes;
  `cd backend && npm test` passes.
- **End-to-end (preview tools, `AUTH_ENABLED=false`):** upload a sample CV →
  Dashboard shows "Your next moves," STAR confidence badges, and clickable course
  links. Then load via `/analyses/latest` and confirm an old-shaped analysis still
  renders and gains course links on read.

## Risks & mitigations

- **Token budget:** `analyzeCV` runs at `max_tokens: 2500`. Adding `next_actions` +
  STAR fields increases output; cap `next_actions` at 3–5 and keep `evidence_basis`
  short. Watch for JSON truncation on long CVs.
- **Old analyses** lack `next_actions` / STAR confidence — UI treats all new fields
  as optional and guards them (no change needed for course links, which are added
  at read time).
