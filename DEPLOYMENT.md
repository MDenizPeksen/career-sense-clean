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
4. **Migrations apply automatically.** `render.yaml`'s build command is
   `npm ci && npm run db:deploy`, so Prisma migrations run against `DATABASE_URL`
   on every deploy. (To apply them by hand instead, run
   `cd backend && DATABASE_URL="<neon-url>" npm run db:deploy` locally.)
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

## 4. Pre-launch checklist (before public marketing)

Run through this before driving real traffic (Reddit, friends, etc.). These are
the things that actually gate a safe, compliant public launch.

**Cost & abuse safety (most important):**

- [ ] **Auth is ON in production.** Anonymous traffic must not be able to run up
  OpenAI cost. Verify **Render** has `AUTH_ENABLED=true` (or unset) *and* a valid
  `CLERK_SECRET_KEY`, and **Vercel** has `VITE_AUTH_ENABLED=true`. The local
  `.env` files ship as `false` for testing — do **not** rely on those values in
  prod. Quick check: open the prod site signed-out and confirm `/upload` and the
  dashboard redirect to login.
- [ ] **OpenAI spend cap set.** At
  <https://platform.openai.com/settings/organization/limits> set a hard monthly
  usage limit (and a lower "notification" threshold). This is your safety net if
  traffic spikes or someone abuses the API.
- [ ] **Rate limits sane.** Defaults: `/analyze` 20/hr per IP, engagement
  endpoints 5/hr per IP. Tune via `CV_ANALYSIS_RATE_LIMIT` / `ENGAGEMENT_RATE_LIMIT`
  if needed.

**Legal / compliance (EU — you operate from Germany):**

- [ ] **Fill the legal placeholders.** `Terms`, `Privacy`, and `Impressum` pages
  contain `[...]` placeholders (legal name, address, contact email, jurisdiction).
  Complete them — an incomplete **Impressum** (`/impressum`, required under § 5
  DDG for a public German site) can draw a warning (*Abmahnung*).
- [ ] **Have the templates reviewed.** Terms/Privacy are good-faith templates,
  not legal advice. Get them checked before relying on them.

**Observability (recommended, optional):**

- [ ] **Sentry.** Create a Node project + a React project at <https://sentry.io>,
  then set `SENTRY_DSN` (Render) and `VITE_SENTRY_DSN` (Vercel). Until set, error
  capture is a safe no-op. Server faults (5xx) are reported automatically.
- [ ] **Email notifications (optional).** To get pinged on feedback/contact/
  waitlist entries, set `RESEND_API_KEY`, `FROM_EMAIL`, `FEEDBACK_NOTIFY_EMAIL`
  on Render (see `backend/.env.example`). Until set, submissions still work and
  simply skip the email; read entries via `cd backend && npm run db:studio`.
- [ ] **Analytics (optional, GDPR-friendly).** If you want traffic metrics for
  marketing, prefer a cookieless tool like **Plausible** (no consent banner
  needed) over Google Analytics / PostHog (which add consent-banner obligations).

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
| Backend  | `AUTH_ENABLED`               | `true` in prod (gates OpenAI cost)     |
| Backend  | `SENTRY_DSN`                 | optional — error monitoring            |
| Backend  | `RESEND_API_KEY`             | optional — feedback/contact/waitlist emails |
| Backend  | `FROM_EMAIL`                 | optional — verified Resend sender      |
| Backend  | `FEEDBACK_NOTIFY_EMAIL`      | optional — inbox for new-entry alerts  |
| Backend  | `PORT`                       | injected by Render automatically       |
| Frontend | `VITE_API_URL`               | `https://<backend>.onrender.com`       |
| Frontend | `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_…`                            |
| Frontend | `VITE_AUTH_ENABLED`          | `true` in prod                         |
| Frontend | `VITE_SENTRY_DSN`            | optional — error monitoring            |

See `backend/.env.example` and `clerk-react/.env.example` for the full local set.
