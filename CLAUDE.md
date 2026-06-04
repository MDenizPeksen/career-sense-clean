# CLAUDE.md

Guidance for Claude Code (and humans) working in this repo. Keep this file
current — it's the first thing read each session.

## What this is

CareerSense is an AI career-guidance app. A user uploads a CV (PDF/DOCX); the
backend extracts the text, sends it to OpenAI (`gpt-4o-mini`), and returns a
structured analysis: profile, strengths, matching roles, resume optimization,
and a learning roadmap. Auth is via Clerk.

The app is evolving from a one-shot CV analyzer into a **stateful career
companion** (multi-turn discovery, saved analyses/roadmaps, progress tracking).
As of the companion roadmap, the backend has a **Postgres database via Prisma**
(`backend/prisma/schema.prisma`, client in `backend/db/`) — it is **no longer
stateless**. User rows are keyed on the Clerk user id. See the roadmap plan at
`~/.claude/plans/yes-absolutely-after-that-resilient-thompson.md`.

## ⚠️ Repo layout — read this first

There are **three** top-level app folders, and one is being retired:

| Folder        | Stack                         | Status                                            |
|---------------|-------------------------------|---------------------------------------------------|
| `backend/`    | Node + Express                | **Active.** The API. Stateless, no DB.            |
| `clerk-react/`| Vite + React 19 + TS + Tailwind | **Active / canonical frontend.** Build here.    |
| `frontend/`   | CRA + webpack + React 18       | **Legacy reference only.** Being ported FROM, then deleted. Do not add features here. |

When asked to work on "the frontend", that means **`clerk-react/`**. `frontend/`
exists only as a source to port features from (see `HANDOFF.md`).

```
backend/
  index.js            # app entry: middleware wiring, clustering, startup
  config/             # server.js (CORS, port), openai.js (model/tokens)
  routes/             # cvRoutes, archetypeRoutes, interviewRoutes, healthRoutes
  controllers/        # thin request handlers -> services
  services/           # openaiService, fileProcessingService
  middleware/         # authMiddleware (Clerk), rateLimit, cache, upload, errorHandler
  prisma/schema.prisma # Postgres data model (User, Analysis, DiscoverySession, ...)
  db/                 # client.js (Prisma singleton), users.js (getOrCreateUser)
clerk-react/src/
  lib/                # apiClient (fetch + Clerk token), errorHandling
  api/                # cv.ts (uploadCV, checkBackendStatus, validateCvFile)
  features/           # cv-upload/, dashboard/, auth/
  components/         # auth/ (ProtectedRoute), layout/ (Header)
  types/analysis.ts   # CvAnalysis — the response contract
```

## Common commands

```bash
# Backend (port 5001)
cd backend && npm install && npm run dev      # nodemon (postinstall runs `prisma generate`)
cd backend && npm start                        # node index.js

# Database (Prisma + Postgres; needs DATABASE_URL in backend/.env — use Neon)
cd backend && npm run db:migrate               # create/apply migrations in dev
cd backend && npm run db:deploy                # apply migrations in prod (Render)
cd backend && npm run db:studio                # browse data

# Frontend (port 3000)
cd clerk-react && npm install && npm run dev    # vite
cd clerk-react && npm run build                 # tsc -b && vite build (run before committing FE changes)
cd clerk-react && npm run lint
```

There are **no automated tests yet** (a known gap — see `HANDOFF.md`). Verify
changes by running the app: backend `/health`, then the upload→dashboard flow.

## Configuration

Copy the `.env.example` files and fill them in. Real `.env`/`.env.local` are
gitignored; the `.env.example` templates are committed (placeholders only).

Key vars (full list in the `.env.example` files and `DEPLOYMENT.md`):
- Backend: `OPENAI_API_KEY`, `NODE_ENV`, `ALLOWED_ORIGINS`, `CLERK_SECRET_KEY`,
  `AUTH_ENABLED`, `DATABASE_URL` (Postgres/Neon — required once DB features are wired).
- Frontend: `VITE_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_AUTH_ENABLED`.

### Auth toggle (currently PAUSED for testing)
Auth is gated so anonymous traffic can't run up OpenAI costs, but it can be
switched off for easy local testing:
- Backend: `AUTH_ENABLED=false` makes `requireAuth` a pass-through.
- Frontend: `VITE_AUTH_ENABLED=false` makes `ProtectedRoute` skip the login gate.

Both are currently `false` in the local env files. **Re-enable (`true`) before
deploying.** With auth enabled and no Clerk keys, protected routes are open in
dev (with a warning) and fail closed (503) in production.

## Conventions

- Backend is CommonJS (`require`); layered routes → controllers → services.
  Throw the custom errors in `utils/errors.js`; the central `errorHandler`
  formats responses (stack traces only when `NODE_ENV !== production`).
- Frontend is strict TS (`noUnusedLocals`/`noUnusedParameters` ON) — unused
  imports fail the build. Icons: `lucide-react`. Animation: `framer-motion`.
  Styling: Tailwind utility classes (no CSS-in-JS).
- **Never fabricate AI output.** Normalization may reshape/rename fields but must
  not invent roles, salaries, skills, etc. (Backend and `cv.ts` both follow this.)
- API base URL comes from env (`VITE_API_URL`) — never hardcode a host.

## Gotchas

- `frontend/` (CRA) and `clerk-react/` (Vite) share concepts but **different env
  conventions**: `process.env.REACT_APP_*` vs `import.meta.env.VITE_*`.
- `docs/API_DOCUMENTATION.md` / `docs/COMPONENT_DOCUMENTATION.md` describe the
  OLD frontend and are partially stale.
- Render's disk is ephemeral — fine, since uploads are temporary (swept hourly).

## More docs
- `HANDOFF.md` — current status, what's done, what's next, how to resume.
- `DEPLOYMENT.md` — Render + Vercel + Clerk deployment walkthrough.
