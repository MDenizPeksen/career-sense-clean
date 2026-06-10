# HANDOFF

Living status doc — what's done, what's next, and how to pick the work back up.
Update the "Last updated" line and the relevant sections whenever you make
meaningful progress.

**Last updated:** 2026-06-04
**Active branch:** `companion-foundation` (→ base `harden-and-deploy`, **PR #2**; stacked
on **PR #1** → `main`). Companion roadmap Phases A–D done; docs refreshed — see below.

> ⏳ **Waiting on O*NET approval.** Registered for O*NET Web Services as org
> "CareerSense" (Step 5/5 submitted; pending email approval). When the approval
> email + credentials arrive: add `ONET_USERNAME`/`ONET_PASSWORD` to `backend/.env`,
> boot the backend, and **smoke-test the live Career Paths path** (`GET /api/career-paths`
> should return `source:"onet"` with O*NET codes). The parsers are fixture-tested but
> the live HTTP endpoints (search / related_occupations / details/skills) have NOT
> been hit yet — adjust `services/data/onetClient.js` paths if O*NET's live shapes differ.

---

## TL;DR

A paused project is being revived: harden the backend → port the core feature
onto a modern Vite frontend → deploy → then port the rest. The backend is
hardened and the core CV-analysis flow runs on the new Vite frontend. Next up is
deploying and porting the remaining features. **Auth is currently paused for
testing** (`AUTH_ENABLED=false`, `VITE_AUTH_ENABLED=false`).

## Project direction (decisions made)

- **Frontend:** rebuild on `clerk-react/` (Vite + React 19). `frontend/` (CRA)
  is reference-only and will be deleted once features are ported.
- **Hosting:** backend → Render/Railway; frontend → Vercel.
- **Persistence:** ~~stay stateless~~ **NOW STATEFUL** — evolving into a career
  companion. Postgres via Prisma (`backend/prisma/schema.prisma`, `backend/db/`).
  See the roadmap plan: `~/.claude/plans/yes-absolutely-after-that-resilient-thompson.md`.
- **Auth:** Clerk, with server-side token verification — currently toggled off
  for testing, re-enable before deploy.

## Status by phase

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Security triage (sanitize env templates, lockfiles, audit) | ✅ Done |
| 1 | Backend hardening (auth, env config, CORS, uploads, dep cleanup) | ✅ Done |
| 2 | Port CV-upload → analysis flow onto Vite | ✅ Done |
| 3 | Deploy (Render + Vercel + Clerk) | ⏳ Config scaffolded; live setup needs user accounts/secrets |
| 4 | Port remaining features; remove `frontend/`; tests + CI | 🔄 In progress |
| 5 | **Career companion** (stateful: DB + agents + real data) | 🔄 Phase A started |

### Companion roadmap (Phase 5) — see the plan file
Plan: `~/.claude/plans/yes-absolutely-after-that-resilient-thompson.md`. Decisions:
go stateful (DB + real auth), first milestone = conversational discovery, real data
(paid OK).
- ✅ **Phase A (DB foundation, code part):** Prisma 6 + Postgres added to `backend/`.
  `prisma/schema.prisma` (User, Analysis, DiscoverySession, Message, Roadmap,
  RoadmapItem, SkillProgress, InterviewSession); `db/client.js` (singleton),
  `db/users.js` (`getOrCreateUser`). `postinstall: prisma generate` + `db:*` scripts.
  Schema validates, client generates, modules require cleanly.
- ⬜ **Phase A (user actions / not yet done):** create a **Neon** Postgres DB and put
  its URL in `backend/.env` as `DATABASE_URL`; run `npm run db:migrate -- --name init`
  to create tables; create a **second Vercel project** rooted at `clerk-react` for
  staging/PR previews (leave production on `frontend/` until parity); flip auth on.
- ✅ **Phase B (persist analyses) DONE + verified:** `db/analyses.js`
  (`saveAnalysis`/`getLatestAnalysis`); `analyzeCV` best-effort saves per user;
  new `GET /analyses/latest`; `getRequestUserId` in authMiddleware (real Clerk id,
  or `local-dev-user` when auth is off so the loop is testable). Dashboard loads
  the latest analysis from the DB when there's no router state (`cv.ts:getLatestAnalysis`).
  Verified end-to-end via the preview (DB seed → `/dashboard` renders from DB, no
  console errors). Note: the upload→save HTTP path reuses the same (tested)
  `saveAnalysis`; not re-exercised via a live CV upload (avoids an OpenAI call).
  - ⬜ `dashboard_scores` still deferred — belongs with the dashboard-depth/parity
    UI session (needs prompt change + a ScoreCard render; not worth a half-step now).
- ✅ **Phase C (Conversational Discovery) DONE + verified:** a multi-turn intake
  agent that asks adaptive follow-ups and emits a structured **enriched profile**.
  - Backend: `services/discoveryService.js` (the agent — one question/turn, JSON
    output, pure `parseAgentResponse`/`buildCvContext` exported for tests; pulls the
    user's latest analysis in as context), `controllers/discoveryController.js`,
    `routes/discoveryRoutes.js` (protected), registered under `/api/discovery`.
    DB layer `db/discovery.js` (createSession / getSession / getActiveSession /
    addMessage / completeSession) persists `DiscoverySession` + `Message`.
    `config/openai.js` gained `discovery` + `interview` token/temperature.
  - Frontend: `features/discovery/Discovery.tsx` (chat UI: resume active session,
    optimistic send, completion → enriched-profile summary card), `api/discovery.ts`,
    `types/discovery.ts`; `/discovery` protected route + header nav.
  - Tests: `backend/test/discoveryService.test.js` (13 `node:test` cases on the
    pure parse/normalize logic). `npm test` wired (`node --test "test/**/*.test.js"`).
  - Verified end-to-end vs real gpt-4o-mini + Neon: start → adaptive multi-turn →
    completion produced an accurate enriched profile (grounded in answers, not
    fabricated); GET-by-id, latest-active (null after completion), and the 400/404
    edge cases all check out. FE builds clean under strict TS. Test rows cleaned up.
- ✅ **Phase D (real-data role-shift + skill-gap) DONE + verified (fallback path):**
  a `GET /api/career-paths` engine that turns the saved analysis (+ discovery
  enriched profile) into career-shift options with **shared vs. gap** skills.
  - `services/data/onetClient.js` — O*NET Web Services client (HTTP Basic via
    `ONET_USERNAME`/`ONET_PASSWORD`, `isConfigured()`, search/related/skills, defensive
    pure parsers). **Courses deferred** (PM call) — labor data only this phase.
  - `services/careerPathService.js` — pure skill-gap logic (normalize/dedupe/
    computeSkillGap/collectUserSkills/buildTransitionsFromAnalysis/aggregateTopGaps)
    + orchestrator `getCareerPaths`: O*NET-grounds each transition when configured
    (`source:'onet'`), else AI-derived from `role_matching` (`source:'analysis'`),
    `source:'none'` when no analysis. Never fabricates — only set-diffs real data.
  - `controllers/careerPathController.js` + `routes/careerPathRoutes.js` (protected).
  - Frontend: `features/career-paths/CareerPaths.tsx` (transition cards w/ shared+gap
    chips, top-skill-gaps banner, data-source badge, empty-state CTA), `api/careerPaths.ts`,
    `types/careerPaths.ts`; `/career-paths` route + nav.
  - Tests: `careerPathService.test.js` (11) + `onetClient.test.js` (8). Suite = 32 green.
  - **Security fix:** `cacheMiddleware` no longer shares a cached response across
    authenticated requests (URL-only key would have leaked one user's data to
    another on user-scoped GETs like discovery/career-paths once auth is on).
  - Verified e2e (fallback): seeded analysis → correct shared/gap split + aggregated
    top gaps (`source:'analysis'`); empty state returns `source:'none'`. **The live
    O*NET HTTP path is unverified** (no creds in this env) — parsers are tested
    against fixtures; smoke-test once `ONET_*` creds are added.
- ⬜ Phases E–F: interactive interview agent, progress "tree". Courses provider
  (Udemy/Coursera) still to pick — deferred from D.
- **Review follow-ups (deferred, documented):** extract a shared `callOpenAIJson`
  helper + move prompts to `services/prompts/` (do in the prompt-tuning/Phase-E
  session where they're exercised); `cluster.isMaster`→`isPrimary`; Redis for
  cache/rate-limit before horizontal scaling; CI + supertest route tests; lint-clean
  the `any` in cv.ts/interview.ts.

### Phase 4 progress
- ✅ Dashboard renders the full `/analyze` payload (archetype incl. inline shape,
  STAR stories, future growth, career-dev insights, resume recommendations).
  Verified end-to-end against a real `gpt-4o-mini` analysis.
- ✅ Polished landing page (`features/home/Home.tsx`), sticky footer, header nav.
- ✅ Mock Interviews page (`features/mock-interviews/MockInterviews.tsx`): role +
  experience-level form → `/api/interview/questions` → question cards with
  category/difficulty badges and collapsible STAR tips. Wired into routing
  (`/interviews`, protected) and header nav. New `api/interview.ts` service +
  `types/interview.ts`. Verified end-to-end against `gpt-4o-mini`.
  - Backend fix: `generateInterviewQuestions` was returning `[]` because the
    model wrapped the array under a non-`questions` key. Tightened the prompt to
    pin the exact `{ "questions": [...] }` shape and made parsing fall back to a
    top-level array / first array-valued property.
- ⬜ Career Paths / profile / legal pages.
- ⬜ Remove `frontend/`; refresh `README.md` + `docs/*`.
- ⬜ Tests + CI.
- Note: OpenAI project currently has only `gpt-4o-mini` enabled (newer models 403).
  A separate task is queued to make rejected uploads return 400 (not 500).

## What's done (detail)

- **Backend hardened & verified** (boots; `/health` 200; protected routes 503 in
  prod without Clerk, pass-through in dev): Clerk auth on `/analyze`,
  `/api/archetype`, `/api/interview/questions`; env-driven OpenAI + rate-limit
  config; `ALLOWED_ORIGINS` CORS allowlist; `trust proxy`; upload `finally`
  cleanup + hourly sweep; removed junk deps; pinned Node engine; **0 npm vulns**;
  removed all fabricated AI fallbacks in `openaiService`.
- **Vite frontend core** (builds under strict TS; renders in-browser with Clerk):
  authed `apiClient`, `cv` service, `CvUpload` page, self-contained `Dashboard`
  result view, protected routing, Tailwind CSS reset.
- **Deploy config:** `render.yaml`, `clerk-react/vercel.json`, `DEPLOYMENT.md`.
- **Dev foundation:** this file, `CLAUDE.md`, `.editorconfig`, `.nvmrc`, and the
  `AUTH_ENABLED` / `VITE_AUTH_ENABLED` testing toggles.

## Next up (Phase 4 — suggested order)

1. Port remaining features from `frontend/` → `clerk-react/`, adapting
   `REACT_APP_*` → `VITE_*` and dropping any fabricated data:
   - Dashboard depth (archetype card, STAR stories, future-growth, scores).
   - Career paths, mock interviews, profile, legal/home pages.
   - The matching backend routes already exist (`/api/archetype`,
     `/api/interview/questions`) — just need frontend + `cv.ts`-style services.
2. Delete `frontend/` once parity is reached; update `README.md` (drop CRA refs)
   and refresh `docs/*`.
3. Add a lean test + CI baseline: backend route smoke tests (supertest), a Vitest
   smoke test on the frontend, and a GitHub Actions workflow (install/lint/build/test).
4. Optional: upgrade Vite to clear the 2 dev-server-only audit findings.

## Before deploying (user actions)

1. **Rotate the OpenAI key** (the old one was kept in local `backend/.env`).
2. Create a **Clerk production instance** (`pk_live_…` / `sk_live_…`).
3. Set `AUTH_ENABLED=true` / `VITE_AUTH_ENABLED=true`.
4. Follow `DEPLOYMENT.md` for Render + Vercel + CORS/Clerk wiring.

## How to resume

```bash
cd /Users/denizpeksen/Documents/career-sense/career-sense-clean
git checkout harden-and-deploy

# run both halves
cd backend && npm install && npm run dev          # :5001
cd clerk-react && npm install && npm run dev        # :3000  (auth paused)
```

Open http://localhost:3000 → "Analyze my CV" → upload a PDF/DOCX → dashboard.
(With auth paused you don't need to sign in; the backend needs a valid
`OPENAI_API_KEY` in `backend/.env` for a real analysis.)

## Open items / watch-outs

- **Uncommitted partial change** in `backend/middleware/uploadMiddleware.js`
  (from the spawned "uploads should 400" task): swaps `Error` → `ValidationError`
  in `fileFilter` so unsupported types return 400. Still TODO in that task:
  surface multer size-limit / `MulterError`s as 400 too, then commit. Decide
  whether to finish it here or via that task's own worktree (avoid double-commit).
- **PR #1** is open (`harden-and-deploy` → `main`):
  https://github.com/MDenizPeksen/career-sense-clean/pull/1
- **Vercel still builds the legacy `frontend/` (CRA) app**, not `clerk-react/`.
  Two reasons it showed the old design: (1) the rebuild lived on an unpushed
  branch until now, and (2) Vercel's Root Directory points at the old app.
  **Decision (PM):** port `clerk-react/` to *visual + feature parity* with the
  old frontend FIRST (Career Paths, profile, home quick-link cards, Contact/legal),
  to be done in a later session with dedicated UI skills — only THEN delete
  `frontend/`, repoint Vercel's Root Directory → `clerk-react`, and merge. Do not
  repoint Vercel before parity or the live site regresses.
- No automated tests yet.
- `docs/API_DOCUMENTATION.md` and `docs/COMPONENT_DOCUMENTATION.md` are stale
  (describe the old CRA frontend).
