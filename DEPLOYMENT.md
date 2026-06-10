# Deploying CareerSense

CareerSense has two deployable pieces plus a database:

- **Backend** (`backend/`) — Express API → **Render** (or Railway).
- **Frontend** (`clerk-react/`) — Vite + React app → **Vercel**.
- **Database** — Postgres (via Prisma) → **Neon** (serverless).

Auth is handled by **Clerk**; the backend verifies Clerk session tokens on the
expensive routes, so both halves must point at the same Clerk instance. The
backend is **stateful** — it needs a `DATABASE_URL` and applied migrations.

---

## 0. Prerequisites (one-time)

1. **Rotate the OpenAI key.** The key previously kept in `backend/.env` must be
   regenerated at <https://platform.openai.com/api-keys>. Use the new key only in
   host dashboards / local `.env` files — never commit it.
2. **Clerk production instance.** In the Clerk dashboard create (or promote) a
   production instance. Note the **Publishable key** (`pk_live_…`) and
   **Secret key** (`sk_live_…`). Add your production frontend domain to Clerk's
   allowed origins once you know the Vercel URL.
3. **Neon Postgres database.** Create a project at <https://neon.tech>, copy the
   connection string (include `?sslmode=require`). This is the backend's
   `DATABASE_URL`. (Optional) **O*NET** — for real career-path data, register at
   <https://services.onetcenter.org/developer/signup> and generate an
   `ONET_API_KEY`; without it, career paths fall back to AI-derived data
   automatically.

---

## 1. Backend → Render

Option A — **Blueprint** (uses `render.yaml`):

1. Render dashboard → **New +** → **Blueprint** → select this repo.
2. Render reads `render.yaml` (web service, `rootDir: backend`, build `npm ci`,
   start `node index.js`, health check `/health`).
3. Fill in the secret env vars when prompted:
   - `OPENAI_API_KEY` — the rotated key
   - `DATABASE_URL` — the Neon connection string (`?sslmode=require`)
   - `CLERK_SECRET_KEY` — `sk_live_…`
   - `CLERK_PUBLISHABLE_KEY` — `pk_live_…`
   - `ALLOWED_ORIGINS` — your Vercel URL (set after step 2; can start as a
     placeholder and update)
   - `ONET_API_KEY` — optional (real career-path data)
   - `NODE_ENV=production` is set by the blueprint.
4. **Apply migrations** against the Neon DB (one-time per schema change). Either
   add `npm run db:deploy` to the Render build/release step, or run it once
   locally with the production `DATABASE_URL`:
   `cd backend && DATABASE_URL="<neon-url>" npm run db:deploy`.
5. Deploy. Confirm `https://<your-backend>.onrender.com/health` returns `status: ok`.

Option B — **Manual web service:** same settings entered by hand (root directory
`backend`, build `npm ci`, start `node index.js`, health check path `/health`).

> Note: Render's disk is ephemeral — fine here, since uploads are temporary and
> swept hourly.

---

## 2. Frontend → Vercel

1. Vercel → **Add New** → **Project** → import this repo.
2. Set **Root Directory** to `clerk-react`. The framework preset is Vite
   (`vercel.json` pins build `npm run build`, output `dist`, and the SPA rewrite).
3. Environment variables:
   - `VITE_API_URL` — the Render backend URL from step 1
   - `VITE_CLERK_PUBLISHABLE_KEY` — `pk_live_…`
4. Deploy. Note the resulting URL (e.g. `https://career-sense.vercel.app`).

---

## 3. Wire the two together

1. In **Render**, set `ALLOWED_ORIGINS` to the exact Vercel URL and redeploy.
2. In **Clerk**, add the Vercel domain to allowed origins / redirect URLs.
3. Smoke test end to end:
   - Open the Vercel URL → sign in via Clerk.
   - Go to **Upload CV**, upload a PDF/DOCX → you should land on the dashboard
     with a real analysis.
   - Confirm a request from a different origin is rejected (CORS) and that error
     responses carry no stack traces (`NODE_ENV=production`).

---

## Environment variable reference

| Where    | Variable                     | Example / notes                        |
|----------|------------------------------|----------------------------------------|
| Backend  | `NODE_ENV`                   | `production`                           |
| Backend  | `OPENAI_API_KEY`             | rotated `sk-…` key                     |
| Backend  | `DATABASE_URL`               | Neon Postgres URL (`?sslmode=require`) |
| Backend  | `CLERK_SECRET_KEY`           | `sk_live_…`                            |
| Backend  | `CLERK_PUBLISHABLE_KEY`      | `pk_live_…`                            |
| Backend  | `ALLOWED_ORIGINS`            | `https://career-sense.vercel.app`      |
| Backend  | `ONET_API_KEY`              | optional — real career-path data       |
| Backend  | `PORT`                       | injected by Render automatically       |
| Frontend | `VITE_API_URL`               | `https://<backend>.onrender.com`       |
| Frontend | `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_…`                            |

See `backend/.env.example` and `clerk-react/.env.example` for the full local set.
