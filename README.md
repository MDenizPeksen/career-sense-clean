# CareerSense

CareerSense is an AI career-guidance app that is evolving from a one-shot CV
analyzer into a **stateful career companion** for people changing careers or
levelling up. Upload a CV and it returns a structured analysis; from there you
can have a guided **discovery** conversation, see **career paths** you can shift
into (with the skills you have vs. the ones to build), and practice **mock
interviews**.

> **📍 Source of truth:** This README is a high-level overview. The always-current
> working docs are **[`CLAUDE.md`](CLAUDE.md)** (architecture, conventions,
> commands, gotchas) and **[`HANDOFF.md`](HANDOFF.md)** (status, what's done,
> what's next). When in doubt, trust those two over anything else in the repo.

## ⚠️ Repo layout — read this first

There are **three** top-level app folders; one is being retired:

| Folder         | Stack                            | Status |
|----------------|----------------------------------|--------|
| `backend/`     | Node + Express (CommonJS)        | **Active.** The API. Stateful (Postgres via Prisma). |
| `clerk-react/` | Vite + React 19 + TS + Tailwind  | **Active / canonical frontend.** Build here. |

When a task says "the frontend," it means **`clerk-react/`**. The old CRA app
(`frontend/`) has been removed now that `clerk-react/` reached parity; production
Vercel builds `clerk-react/` (Root Directory `clerk-react`, Vite).

## What it does

- **CV analysis** — upload PDF/DOCX → profile, strengths, role matches, résumé
  optimization, STAR stories, a learning roadmap, and a career archetype.
- **Conversational discovery** — a multi-turn agent that asks adaptive questions
  to understand your goals/constraints and produces an enriched profile.
- **Career paths** — real role-shift options with a per-role **shared vs. gap**
  skill breakdown (grounded in O*NET labor data when configured; AI-derived
  otherwise).
- **Mock interviews** — role/level-specific practice questions.

## Tech stack

- **Backend:** Node + Express, layered `routes → controllers → services → db`,
  OpenAI (`gpt-4o-mini`), Prisma + Postgres (Neon), Clerk auth, Multer + pdf-parse
  + mammoth for uploads.
- **Frontend:** Vite + React 19 + TypeScript (strict), Tailwind CSS,
  framer-motion, lucide-react, Clerk.
- **Data:** O*NET Web Services (optional, for real labor-market data).

## Getting started

Prereqs: Node ≥ 18, npm, an OpenAI API key, and a Postgres database (Neon is the
default). Copy the `.env.example` templates and fill them in (real `.env` files
are gitignored).

```bash
# Backend (port 5001)
cd backend
cp .env.example .env          # then fill in OPENAI_API_KEY, DATABASE_URL, etc.
npm install
npm run db:migrate            # create tables (first time)
npm run dev

# Frontend (port 3000) — in a second terminal
cd clerk-react
cp .env.example .env.local    # then fill in VITE_API_URL, VITE_CLERK_*
npm install
npm run dev
```

Open <http://localhost:3000>. Auth can be paused for local testing via
`AUTH_ENABLED=false` (backend) and `VITE_AUTH_ENABLED=false` (frontend) — see the
auth-toggle section in `CLAUDE.md`. Re-enable before deploying.

Common commands (full list in `CLAUDE.md`):

```bash
cd backend && npm test          # node:test unit tests
cd backend && npm run db:studio # browse the database
cd clerk-react && npm run build # tsc -b && vite build (run before committing FE changes)
```

## Documentation

- **[`CLAUDE.md`](CLAUDE.md)** — architecture, conventions, commands, gotchas (living).
- **[`HANDOFF.md`](HANDOFF.md)** — current status and roadmap (living).
- **[`DEPLOYMENT.md`](DEPLOYMENT.md)** — Render + Vercel + Clerk + DB walkthrough.
- **[`CONTRIBUTING.md`](CONTRIBUTING.md)** — contribution guidelines.
- `docs/API_DOCUMENTATION.md` — endpoint reference; the "Current endpoints"
  section is maintained, older per-endpoint detail is historical (see its banner).

## License

MIT — see [LICENSE](LICENSE).
