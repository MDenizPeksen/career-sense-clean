# CareerSense — frontend (`clerk-react`)

The **canonical** CareerSense frontend: Vite + React 19 + TypeScript (strict) +
Tailwind CSS, with Clerk for auth. This is the app to build on. (The legacy
`../frontend` CRA app is reference-only and being retired — see the root
[`README.md`](../README.md) and [`CLAUDE.md`](../CLAUDE.md).)

## Develop

```bash
cp .env.example .env.local     # set VITE_API_URL, VITE_CLERK_PUBLISHABLE_KEY, VITE_AUTH_ENABLED
npm install
npm run dev                    # http://localhost:3000
```

Needs the backend running on its port (default 5001) — see the root README.

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build  (run before committing FE changes)
npm run lint     # ESLint
npm run preview  # serve the production build locally
```

## Conventions

- **Strict TS** (`noUnusedLocals`/`noUnusedParameters`) — unused imports fail the build.
- Data fetching goes through `src/lib/apiClient.ts` (adds the Clerk token); per-feature
  services live in `src/api/*`, response contracts in `src/types/*`.
- Icons: `lucide-react`. Animation: `framer-motion`. Styling: Tailwind utilities (no CSS-in-JS).
- The API base URL comes from `VITE_API_URL` — never hardcode a host.

## Layout

```
src/
  lib/         # apiClient, errorHandling
  api/         # cv.ts, interview.ts, discovery.ts, careerPaths.ts
  features/    # home/, cv-upload/, dashboard/, discovery/, career-paths/, mock-interviews/, auth/
  components/  # auth/ (ProtectedRoute), layout/ (Header, Footer)
  types/       # analysis.ts, interview.ts, discovery.ts, careerPaths.ts
```
