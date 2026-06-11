# CareerSense — Product Overview & Current Workflows

> **Purpose of this document:** a single, plain-English map of what CareerSense
> does today — every page, every workflow, what data flows where, and what the AI
> actually produces. Written to be the starting point for a brainstorming session
> about which features to add, adjust, or reorder, and what the end-to-end user
> flow *should* be.
>
> Sections §1–§6 map the app **as it is today**. Sections §7–§10 set the
> **committed target experience and the sequenced roadmap** to get there.
>
> Last updated: 2026-06-11. Reflects the `course-provider` branch state, plus the
> agreed companion roadmap (§7–§10).

---

## 1. What is CareerSense?

CareerSense is an **AI career-guidance web app**. A user uploads their CV
(PDF/DOCX); the app extracts the text, sends it to OpenAI (`gpt-4o-mini`), and
returns a structured career analysis — profile, strengths, matching roles, resume
fixes, and a learning roadmap.

It is evolving from a **one-shot CV analyzer** into a **stateful career
companion**: multi-turn discovery conversation, saved analyses, data-grounded
career paths (via O*NET), and — next — an interactive mock-interview agent and a
progress tracker. Auth is via Clerk; data is persisted in Postgres (Neon) through
Prisma.

**The thesis:** most "AI resume tools" stop at a one-time critique. CareerSense
wants to be *directive and supportive over time* — understand the person once,
ground advice in real labor-market data, and actually help them prepare. The
target shape is an **intent-routed companion**: the user uploads a CV, tells us
*why they're here* (career change / discovery / interview prep), and that context
is assembled into a **single knowledge base** that every feature reads from. The
**personalized, evaluating mock-interview agent is the core value driver** — and
the knowledge base is the *spine* that lets it already know the applicant.
Everything upstream exists to feed it good context. See §7–§9 for where this goes.

**Tech stack (one line):** Node/Express backend (CommonJS), Vite + React 19 + TS
frontend (`clerk-react/`), Postgres via Prisma, Clerk auth, OpenAI `gpt-4o-mini`.

---

## 2. The website — pages & navigation

The header exposes six destinations. All except Home are **protected** (require
sign-in, though auth is currently toggled off for local testing).

| Nav item | Route | Protected | What it is |
|----------|-------|-----------|------------|
| Home | `/` | No | Landing page (marketing, feature cards, CTA). *Being redesigned separately.* |
| Upload CV | `/upload` | Yes | Drag-and-drop CV upload → triggers analysis → routes to Dashboard. |
| Dashboard | `/dashboard` | Yes | Renders the full CV analysis (the big result view). |
| Discovery | `/discovery` | Yes | Multi-turn chat that enriches the user's profile beyond the CV. |
| Career Paths | `/career-paths` | Yes | Role-shift options + skill gaps, grounded in O*NET, with course links. |
| Mock Interviews | `/interviews` | Yes | *Today:* generates a static list of practice questions. *Phase 3:* becoming an interactive, evaluating agent. |

Auth pages: `/login`, `/signup` (Clerk).

**Observation for brainstorming:** the nav is a *flat list of tools*, not a
*guided journey*. A new user lands with six equally-weighted choices and no
obvious "start here / do this next" path. (See §7.)

---

## 3. The workflows, end to end

### 3.1 CV Upload → Analysis (the front door)

**Flow:** `/upload` → user drops a PDF/DOCX → `POST /analyze` (multipart) →
backend extracts text → OpenAI → structured JSON → saved to DB → user routed to
`/dashboard`.

- **Frontend:** `features/cv-upload/`, `api/cv.ts`.
- **Backend:** `routes/cvRoutes.js` → `controllers/cvController.js` →
  `services/fileProcessingService.js` (PDF/DOCX → text) + `services/openaiService.js`
  (`analyzeCV`).
- **Persistence:** best-effort `saveAnalysis` writes the full payload to the
  `Analysis` table, keyed to the user. `GET /analyses/latest` re-loads it.
- **Upload handling:** files are temporary (swept hourly); unsupported types
  return 400.

**What the analysis actually contains** (the single richest object in the app —
produced by `prompts/analysisPrompt.js`):

- `user_profile` — name, current role, sector, location, years of experience,
  education, skills, industries, contact links.
- `profile_strengths` — top skills, core competencies, quantifiable achievements.
- `analysis` — strengths, improvement areas, missing elements, keyword
  optimization, recommended roles.
- `role_matching` — **exactly 3 roles**, each with match %, transition difficulty,
  required skills, description, salary range. *(This feeds Career Paths.)*
- `resume_optimization` — bullet rewrites (original → optimized), missing ATS
  keywords, formatting feedback, general recommendations.
- `star_interview_stories` — STAR-structured stories mined from their experience.
  *(Directly relevant to the interview agent.)*
- `personalized_learning_roadmap` — recommended courses/skills with platform,
  impact, difficulty, duration. *(Note: AI-suggested, **not** real URLs.)*
- `future_growth_potential` — trajectory, skills forecast, industry insights.
- `career_development_insights` — strengths leverage, networking, personal brand.
- `recruiter_friendly_summary` — a 5-sentence professional summary.
- `archetype` — primary/secondary career archetype + strengths/growth areas.

**Observation:** there is a *lot* of latent content here that the rest of the app
barely uses. `star_interview_stories`, `archetype`, and the skills lists are
exactly the raw material a mock-interview agent or a sharper discovery flow would
want.

### 3.2 Dashboard (the result view)

**Flow:** `/dashboard` renders the analysis — either from router state (just
uploaded) or by calling `GET /analyses/latest` from the DB.

- **Frontend:** `features/dashboard/`.
- It surfaces the analysis sections above (archetype card, STAR stories, growth,
  resume recommendations, etc.).
- `dashboard_scores` (numeric scorecards) is noted as deferred — not yet wired.

### 3.3 Conversational Discovery (the "understand the person" step)

**Flow:** `/discovery` → chat UI → agent asks **one adaptive question per turn**
→ after ~6 answers it **completes** and emits a structured **enriched profile**.

- **Frontend:** `features/discovery/Discovery.tsx`, `api/discovery.ts`.
- **Backend:** `routes/discoveryRoutes.js` → `controllers/discoveryController.js`
  → `services/discoveryService.js`; prompt in `prompts/discoveryPrompt.js`.
- **Endpoints:** `POST /discovery/sessions` (start),
  `POST /discovery/sessions/:id/messages` (turn),
  `GET /discovery/sessions/latest` (resume active), `GET /discovery/sessions/:id`.
- **Persistence:** `DiscoverySession` + `Message` rows; the final
  `enrichedProfile` JSON is stored on the session.
- **Context:** the agent is fed the user's latest CV analysis, so it doesn't
  re-ask what the CV already answers.

**The 7 dimensions discovery tries to understand:**
1. Motivation for change / what's prompting this
2. Current situation (role, industry, day-to-day)
3. Where they want to go (target roles/directions, even if fuzzy)
4. Target industries / domains
5. Constraints: location/remote, timeline, compensation
6. Risk tolerance and appetite for retraining
7. Learning preferences and time available to upskill

**The enriched profile it emits:** headline, motivation, current situation,
target roles, target industries, constraints (location/timeline/comp), risk
tolerance, learning preferences, strengths to leverage, open questions.

**Observation:** discovery is well-built but **optional and disconnected** — it's
just another nav item. Nothing forces or even nudges the user through it before
Career Paths, even though its `enrichedProfile` makes every downstream feature
better. This is the most under-leveraged asset in the app. (See §7.)

### 3.4 Career Paths (data-grounded role shifts + skill gaps)

**Flow:** `/career-paths` → `GET /api/career-paths` → backend reads the saved
analysis (+ discovery enriched profile) → builds role-shift options with
**shared vs. gap** skills → grounds them in **O*NET** when configured → returns
transitions + aggregated top skill gaps + **course links** per gap.

- **Frontend:** `features/career-paths/CareerPaths.tsx`, `api/careerPaths.ts`.
- **Backend:** `routes/careerPathRoutes.js` → `controllers/careerPathController.js`
  → `services/careerPathService.js`; data via `services/data/onetClient.js`
  (O*NET v2, `X-API-Key`) and `services/data/courseProvider.js` (Udemy/Coursera
  search links).
- **Data source badge:** `onet` (real labor data) / `analysis` (AI-derived
  fallback) / `none` (no analysis yet). Never fabricates — only set-diffs real
  skill lists.
- **Course links (newest feature):** each top skill gap gets Udemy + Coursera
  search links (no API key, deterministic search URLs). On PR #4.

### 3.5 Mock Interviews (today: a question generator)

**Flow:** `/interviews` → user enters target role + experience level →
`POST /api/interview/questions` → OpenAI returns a list of questions → rendered as
cards with category/difficulty badges and a generic STAR tip.

- **Frontend:** `features/mock-interviews/MockInterviews.tsx`, `api/interview.ts`.
- **Backend:** `routes/interviewRoutes.js` → `controllers/interviewController.js`
  → `openaiService.generateInterviewQuestions`.
- **It is one-shot and non-interactive:** no answering, no feedback, no scoring,
  no persistence. The `InterviewSession` table (role, level, transcript, feedback)
  **already exists in the schema but is unused** — scaffolding for Phase 3.

**This is the feature slated to become the core value driver (Phase 3 — see §9).**

---

## 4. Data model (Prisma / Postgres)

Every row is keyed on the Clerk user id. Created lazily on first authed request.

| Model | Purpose | Status |
|-------|---------|--------|
| `User` | One row per Clerk user. | Active |
| `Analysis` | Full `/analyze` payload (JSON), query latest by user. | Active |
| `DiscoverySession` + `Message` | Multi-turn discovery transcript + `enrichedProfile`. | Active |
| `Roadmap` + `RoadmapItem` | Learning roadmap toward a target role (skill, course, platform, url, status, order). | **Schema only — unused** |
| `SkillProgress` | Per-skill level 0–100, to drive a progress visualization. | **Schema only — unused** (Phase 4) |
| `InterviewSession` | Role, level, `transcript` (JSON), `feedback` (JSON). | **Schema only — unused** (Phase 3) |

**Takeaway:** the persistence layer is already designed for the *companion*
vision. Three tables (`Roadmap`, `SkillProgress`, `InterviewSession`) are waiting
for features — they are filled in by Phase 3 (interview agent) and Phase 4
(progress tree) of the roadmap in §9.

---

## 5. How the pieces connect today (data flow)

```
            ┌──────────────┐
  CV file → │  /analyze    │ → Analysis JSON ──┐ (saved to DB)
            └──────────────┘                   │
                                               ├─→ Dashboard (renders it)
                                               │
                                               ├─→ Discovery (uses it as context,
                                               │     emits enrichedProfile)
                                               │
                                               └─→ Career Paths (role_matching +
                                                     enrichedProfile → O*NET gaps
                                                     → course links)

  Mock Interviews:  role + level (typed by user) → questions.   ← NOT connected
                    Ignores the analysis, the STAR stories,
                    the archetype, and the discovery profile.
```

**The key structural gap:** the analysis and the enriched profile are rich, but
the **Mock Interview feature ignores both** — the user re-types a role from
scratch. The single biggest "make it feel intelligent" win is wiring the existing
context *into* the interview.

---

## 6. Known gaps & watch-outs (factual, not speculative)

- **No guided onboarding.** Six flat nav items; no first-run path.
- **Discovery is optional and unwired downstream of Career Paths.** Its
  `enrichedProfile` could feed interviews and roadmaps but currently only feeds
  Career Paths.
- **Mock Interviews is one-shot** and context-blind (see §5).
- **`personalized_learning_roadmap` has no real URLs** (AI-invented platforms).
  The new `courseProvider` (real search links) lives only in Career Paths; the
  Dashboard roadmap still shows un-clickable suggestions. `Roadmap`/`RoadmapItem`
  tables are unused.
- **`SkillProgress` / progress tree** (Phase 4) not started.
- **O*NET is US-centric** (SOC codes, US-derived occupation graph). Skills are
  portable; the *transition graph* skews American. Labelled via the source badge.
- **Auth is paused** (`AUTH_ENABLED=false`) for local testing; re-enable before
  deploy.
- **Frontend has no test suite / the model is `gpt-4o-mini` only** (newer models
  403 on the current OpenAI project).

Each of these gaps is addressed by a phase in the roadmap (§9): onboarding +
context-blindness by Phases 2–3, the un-clickable roadmap URLs by Phase 1, the
unused `Roadmap`/`SkillProgress` tables by Phase 4, and the compliance/auth items
by the parallel track in §10.

---

## 7. Target experience (where we're going)

The decided direction: turn the flat toolkit into a **guided companion** with one
governing principle — **learn the person once, reuse that context everywhere.**

The end-to-end flow we're building toward:

```
  ┌─────────────┐   ┌──────────────────┐   ┌──────────────┐   ┌────────────────────┐
  │ Upload CV   │ → │ Richer, directive │ → │ Intent picker│ → │ Knowledge base     │
  │ (+ consent) │   │ analysis          │   │ (3 journeys) │   │ (UserContext, §8)  │
  └─────────────┘   └──────────────────┘   └──────────────┘   └─────────┬──────────┘
                                                                         │
                          everything below reads from the knowledge base │
                                                                         ▼
                    ┌──────────────────────────┐   ┌───────────────────────────────┐
                    │ Personalized interview    │ → │ Close the loop: saved roadmap │
                    │ agent — asks + EVALUATES   │   │ (real courses) + progress     │
                    └──────────────────────────┘   └───────────────────────────────┘
```

**The three journeys** captured by the intent picker (they re-weight and extend the
*same* knowledge base rather than forking the whole app):
- **Career change** → discovery → career paths → saved roadmap.
- **Prepare for a specific role** → interview agent with the role pre-filled →
  targeted gap closing.
- **Career discovery / improve my CV** → resume optimization, ATS keywords,
  recruiter summary, archetype.

The "wow" moment we're aiming at: a mock interview where the agent *already knows
the applicant* — pulls their target role from the analysis, coaches against their
own STAR stories, evaluates each answer, and ends with a report (strengths, gaps, a
revised STAR story) the user can act on.

---

## 8. The knowledge base (UserContext) — the spine

Today there is **no single place that knows everything about a user**. The only
aggregation that exists is inside `services/careerPathService.js` (~lines 190–247),
which manually merges the latest analysis with the enriched discovery profile;
every other feature re-fetches pieces on its own, and the interview feature fetches
*nothing*. That is the structural reason the app feels like separate tools.

**The fix:** a single assembler — a new `services/userContextService.js` exposing
`getUserContext(clerkUserId)` — that returns one normalized object:

```
UserContext = {
  profile,           // from Analysis.user_profile
  strengths,         // evidence-linked, from profile_strengths
  archetype,         // canonical taxonomy (see Phase 1)
  starStories,       // the user's own STAR baseline
  targetRoles,       // role_matching + enrichedProfile.target_roles
  skills,            // merged + deduped skill set
  intent,            // career-change / role-prep / discovery (Phase 2)
  enrichedProfile,   // from the completed DiscoverySession
  skillProgress,     // per-skill 0–100 (Phase 4)
}
```

`careerPathService` and discovery's `buildCvContext` get refactored to consume it,
and **every agent (analysis follow-ups, interview, future features) reads from this
one source.** This is what makes "an agent that already knows you" tractable
instead of re-plumbed per feature.

---

## 9. Sequenced roadmap

Phase 0 runs in parallel (see §10). Phases 1→4 are ordered; each gets its own spec
before implementation.

**Phase 1 — Richer, directive analysis (first build).**
Deepen `services/prompts/analysisPrompt.js` so the *root* knowledge is directive and
evidence-grounded, not just descriptive:
- Add a ranked **"next best actions"** output tied to the user's goal — the single
  biggest "it actually told me what to do" win.
- **Ground STAR stories in CV evidence**; flag thin ones as *drafts to refine*
  rather than asserting them (honors the "never fabricate" rule in `CLAUDE.md`).
- Define a **canonical archetype taxonomy** (8–10 named archetypes) shared across
  features, replacing the ad-hoc invention in `prompts/archetypePrompt.js`.
- Make strengths **evidence-linked** (point back to CV facts).
- **Wire real course links** (`services/data/courseProvider.js`, already used in
  Career Paths) into `personalized_learning_roadmap`, replacing the AI-invented
  URLs — this is the "real courses / real insights" the product promises.
- Frontend: extend the `api/cv.ts` types and `features/dashboard/` to render the
  ranked next actions, evidence-tied strengths, and clickable real courses.
*Done when:* the Dashboard shows ranked next actions, evidence-tied strengths, a
consistent archetype, and clickable real courses.

**Phase 2 — Knowledge-base spine + intent routing.**
Post-upload **intent picker** (career change / role prep / discovery) stored on the
user/session; build `getUserContext` (§8); refactor Career Paths + Discovery to
consume it.
*Done when:* one call returns everything we know about a user, and intent is captured.

**Phase 3 — Interview agent (the value driver).**
Multi-turn (ask → user answers → follow-up), seeded from `UserContext` (role
pre-filled, the user's own STAR stories as the coaching baseline), with per-answer
evaluation and an end-of-session report (strengths, gaps, a revised STAR story),
persisted to the existing `InterviewSession` table (`transcript` + `feedback`).
*Done when:* a user completes a graded mock interview that references their own CV.

**Phase 4 — Close the loop / motivation.**
Persist `Roadmap`/`RoadmapItem` (real courses) and tick `SkillProgress` as the
visible reason to return; a simple progress view.
*Done when:* finishing an interview or identifying gaps produces a saved, trackable
plan the user comes back to.

---

## 10. Compliance track (parallel — gate before real users)

CareerSense sends CV text (name, email, location, history) to a third party
(OpenAI) and stores the derived profile long-term, so GDPR/SOC2 readiness is a
*prerequisite for onboarding real/EU users* — but it is designed-for-now and does
**not block** feature work. What already exists: per-user data isolation (Clerk id
boundary), cascade deletes in the schema, immediate temp-file deletion + hourly
sweep (`services/fileProcessingService.js`), and rate limiting.

What's **missing** and tracked here (build before launch, re-enable
`AUTH_ENABLED=true` at the end):

- [ ] **Consent capture** at upload + `consentedAt` on the `User` model.
- [ ] **Data export** — `GET /api/users/me/export` (GDPR portability).
- [ ] **Account deletion** — `DELETE /api/users/me` (erasure; the cascade is
      already in the schema, just needs an endpoint).
- [ ] **Retention** — sweep analyses/sessions older than N months.
- [ ] **Privacy policy** — *create* the page (it does **not** exist yet — there is
      no `legal/` component despite earlier notes) and link it in the footer/menu.
- [ ] **DPA & sub-processor doc** — OpenAI, Clerk, Neon, O*NET + a cross-border
      transfer note (CV text → OpenAI/US).
- [ ] Consider **PII minimization/redaction** before CV text leaves the system.

*Done when:* a user can record consent, export all their data, and delete their
account, and the privacy policy is live.

---

## 11. Pointers for going deeper

- `CLAUDE.md` — repo layout, conventions, commands, gotchas.
- `HANDOFF.md` — living status: what's done, what's next, how to resume.
- `docs/superpowers/specs/` — design specs (e.g. the course-provider design).
- `backend/services/prompts/` — the actual AI prompts (analysis, discovery,
  archetype, interview). **Read these to judge content quality.**
- `backend/prisma/schema.prisma` — the full data model.
