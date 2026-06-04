# HANDOFF

Living status doc — what's done, what's next, and how to pick the work back up.
Update the "Last updated" line and the relevant sections whenever you make
meaningful progress.

**Last updated:** 2026-06-03
**Active branch:** `harden-and-deploy` (not yet merged to `main` or pushed; 8 commits)

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
- **Persistence:** stay stateless (no DB) for now.
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

### Phase 4 progress
- ✅ Dashboard renders the full `/analyze` payload (archetype incl. inline shape,
  STAR stories, future growth, career-dev insights, resume recommendations).
  Verified end-to-end against a real `gpt-4o-mini` analysis.
- ✅ Polished landing page (`features/home/Home.tsx`), sticky footer, header nav.
- ⬜ Mock Interviews page (backend `/api/interview/questions` exists).
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
- PR for `harden-and-deploy` not yet opened (no GitHub auth on the machine —
  needs `gh auth login` or a PAT; PR body saved at `/tmp/careersense_pr_body.md`).
- No automated tests yet.
- `docs/API_DOCUMENTATION.md` and `docs/COMPONENT_DOCUMENTATION.md` are stale
  (describe the old CRA frontend).
