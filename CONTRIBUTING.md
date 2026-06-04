# Contributing to CareerSense

Thank you for considering contributing to CareerSense! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## Project Structure

See **[`CLAUDE.md`](CLAUDE.md)** for the authoritative, current layout and
conventions. In brief, the active code lives in two folders (a third, `frontend/`,
is **legacy/reference-only** and is being retired — don't build there):

```
career-sense-clean/
├── backend/               # Node + Express API (CommonJS), stateful (Postgres via Prisma)
│   ├── index.js           # App entry: middleware wiring, startup
│   ├── config/            # server.js (CORS/port), openai.js (model/tokens)
│   ├── routes/            # route definitions  -> controllers
│   ├── controllers/       # thin request handlers -> services
│   ├── services/          # business logic (openaiService, discoveryService, careerPathService, data/)
│   ├── middleware/        # auth (Clerk), rate limit, cache, upload, errorHandler
│   ├── db/                # Prisma client + access helpers (users, analyses, discovery)
│   ├── prisma/            # schema.prisma + migrations
│   ├── test/              # node:test unit tests
│   └── uploads/           # temporary file uploads (swept hourly)
│
└── clerk-react/           # Canonical frontend: Vite + React 19 + TS + Tailwind
    └── src/
        ├── lib/           # apiClient (fetch + Clerk token), errorHandling
        ├── api/           # per-feature service modules
        ├── features/      # feature modules (cv-upload, dashboard, discovery, career-paths, ...)
        ├── components/    # auth/ (ProtectedRoute), layout/ (Header, Footer)
        └── types/         # response contracts
```

## Development Guidelines

### Backend (Node.js/Express, CommonJS)

1. **Layered structure**: keep the `routes → controllers → services → db` flow; controllers stay thin.
2. **Error handling**: throw the custom errors in `utils/errors.js`; the central `errorHandler` formats responses.
3. **Environment variables**: store config in env vars, documented in `backend/.env.example` (never commit a real `.env`).
4. **Never fabricate AI output**: normalization may reshape/rename fields but must not invent roles, skills, salaries, etc.
5. **Tests**: add `node:test` unit tests under `backend/test/` for pure logic; run `npm test`.

### Frontend (React/TypeScript, `clerk-react`)

1. **Feature-based organization**: group components by feature under `src/features/`.
2. **Strict TS**: `noUnusedLocals`/`noUnusedParameters` are on — unused imports fail the build. Run `npm run build` before committing FE changes.
3. **API access**: go through `src/lib/apiClient.ts`; put services in `src/api/*` and contracts in `src/types/*`. Never hardcode the API host — use `VITE_API_URL`.
4. **Styling**: Tailwind utilities (no CSS-in-JS). Icons: `lucide-react`. Animation: `framer-motion`.

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure your code follows the established code style.
4. Update the documentation if necessary.
5. Issue the pull request.

## Commit Message Guidelines

We follow conventional commits for our commit messages:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code changes that neither fix bugs nor add features
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Changes to the build process or auxiliary tools

## Getting Help

If you need help with anything, please open an issue or reach out to the maintainers.

Thank you for contributing to CareerSense!
