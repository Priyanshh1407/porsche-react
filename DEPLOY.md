# Deploying

This project is not deployed; it lives in this repository. This guide describes one way to host it
on free tiers: **Neon** (PostgreSQL), **Render** (the API) and **Vercel** (the static frontend).
Any equivalent hosts work. The parts that matter are the environment variables, the migration
step, the `/ready` health check and the CORS origin. Host dashboards change often, so check each
provider's current docs for the exact screens.

```
Browser ──> Vercel (static build + 3D models) ──/api──> Render (Express + email and AI-triage workers + live events) ──> Neon (Postgres)
                                                                        └──> Google Gemini (optional)
```

Deploy in this order: database, then API, then frontend, then point the API's CORS at the
frontend.

## 1. Database: Neon

1. Create a project and a database (e.g. `porsche`).
2. Copy **two** connection strings:
   - the **direct** one (no `-pooler` in the host): used to run migrations, since Prisma's
     migration engine needs a direct session;
   - the **direct** one for the app at runtime too. The live admin dashboard keeps one `LISTEN`
     connection open, and Neon's pooled endpoint (PgBouncer in transaction mode) does not support
     `LISTEN`: with the pooled string everything else works, but the dashboard never receives live
     updates.
3. From your machine, apply the migrations once:
   ```bash
   cd porsche-backend
   DATABASE_URL="<direct connection string>" npx prisma migrate deploy
   ```
   On Windows PowerShell: `$env:DATABASE_URL="<direct connection string>"; npx prisma migrate deploy`.
   Moving an existing database created with `prisma db push`? Follow
   [`porsche-backend/prisma/MIGRATIONS.md`](porsche-backend/prisma/MIGRATIONS.md) instead.

## 2. API: Render (Web Service)

| Setting | Value |
|---|---|
| Root directory | `porsche-backend` |
| Build command | `npm ci && npx prisma migrate deploy` (`npm ci` also generates the Prisma client via `postinstall`) |
| Start command | `npm start` |
| Health check path | `/ready` (fails while the database is unreachable; `/health` only says the process is up) |
| Node version | from `engines` in `package.json`: `^20.19 \|\| ^22.12 \|\| >=24` |

Environment variables (names from `porsche-backend/.env.example`):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | a random string (longer is harder to guess), e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | the dashboard login (a single admin) |
| `FRONTEND_URL` | the exact frontend origin, e.g. `https://your-app.vercel.app` (no trailing slash). CORS allows only this origin. |
| `TRUST_PROXY` | `1`: Render puts one proxy in front of the app. Without it, every visitor shares one rate-limit bucket. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | optional SMTP. With `EMAIL_PASS` empty, emails are logged instead of sent. |
| `GEMINI_API_KEY` | optional: turns on AI lead triage and the concierge chat. Without it both stay off (leads are still queued for triage). |
| `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL` | optional: model (default `gemini-3.8-flash`) and the fallbacks tried on overload or rate limits (default `gemini-3.6-flash,gemini-3.5-flash-lite`) |

`PORT` is provided by Render. The server refuses to start if a required variable is missing or the
database doesn't answer, so a wrong value shows up as a failed deploy, not a broken site.

**Free-tier behaviour:** the service sleeps when idle, and the first request after that waits for a
cold start (tens of seconds). The email and AI-triage workers run inside this process, so work for
a lead submitted just before the service slept is done when it next wakes. It stays in the
database, and nothing is lost.

**Live admin updates (Server-Sent Events):** the dashboard keeps a long-lived
`/api/admin/events` stream open. The stream sends a heartbeat every 25 s, which keeps proxies from
closing it as idle; the browser reconnects by itself if it drops. The single-use stream tickets are
kept in the API's memory, so with **more than one API instance** enable sticky sessions (or keep
one instance). Background jobs and events already work across instances.

## 3. Frontend: Vercel

| Setting | Value |
|---|---|
| Root directory | `porsche-react-master` |
| Framework preset | Create React App |
| Build command / output | `npm run build` / `build` |
| Environment variable | `REACT_APP_API_URL=https://<your-api>.onrender.com` (baked in at build time; rebuild after changing it) |

Add `porsche-react-master/vercel.json`, so client-side routes (e.g. `/models/taycan`) load the
app on refresh, and so the 3D models are cached:

```json
{
  "rewrites": [{ "source": "/((?!static/|.*\\.[a-z0-9]+$).*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)\\.glb",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=604800, stale-while-revalidate=86400" }]
    }
  ]
}
```

Why not `immutable` for the models: files in `public/` keep their names across builds (unlike
`static/js` and `static/media`, which CRA content-hashes). A year-long immutable cache would keep
serving an old model after you replace one. To cache models "forever", rename the file whenever
it changes.

Check the host's per-file size limit before deploying: the largest model is 65.9 MB.

## 4. Point the API at the frontend

Set `FRONTEND_URL` on Render to the final Vercel URL (or your custom domain) and redeploy the API.

## 5. Verify

```bash
curl -i https://<your-api>.onrender.com/ready        # 200 {"status":"ready"} once the DB answers
node porsche-react-master/scripts/measure-page-weight.cjs --base https://<your-frontend>   # bytes per route, live
```

Then by hand: submit the contact form, log in at `/admin/login`, and check that the lead appears
with its email status, the dashboard shows the green "Live" dot, and (with `GEMINI_API_KEY` set)
the lead gets an AI score within a minute. The 3D stage-screenshot comparison (`capture-stages.cjs`) runs against a
local production build, not a URL. Run `npm run verify:full` before deploying instead.

## Before a live demo

- Open `/ready` a minute before showing it, to wake a sleeping free-tier API.
- The 3D pages need a WebGL-capable GPU; the GT3 RS page downloads about 70 MB.
- The free Gemini tier allows about 5 requests per minute per model; pace the chat in a demo.
- The site is non-commercial: two of the 3D models are CC BY-NC-SA (see `/credits`), and the
  photographs are for demonstration only.
