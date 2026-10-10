# Backend (porsche-backend)

Express 5 · Prisma 7 (pg adapter) · PostgreSQL · nodemailer. Project overview: [root README](../README.md).

```bash
cp .env.example .env         # see the comments in it
npm install                  # postinstall runs `prisma generate`
npx prisma migrate deploy    # apply migrations (see prisma/MIGRATIONS.md)
npm start                    # http://localhost:5000
npm test                     # needs the Docker test DB: npm run test:db:up
```

The server refuses to start without `DATABASE_URL`, `JWT_SECRET` (32+ chars), `ADMIN_EMAIL` and
`ADMIN_PASSWORD`, or if the database doesn't answer. It shuts down cleanly on SIGTERM/SIGINT.

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | The process is up (never touches the DB) |
| GET | `/ready` | The database answers (use for load-balancer health checks) |
| POST | `/api/contact/submit` | Validated; 5 per hour per IP; saves the lead and its emails atomically |
| GET | `/api/contact/models` | Model options for the form |
| POST | `/api/admin/login` | Returns a JWT; 5 failed attempts per 15 min per IP |
| GET | `/api/admin/contacts` | Admin. Server-side search (`q`), filters (`status`, `inquiryType`), paging (`page`, `limit`) |
| GET | `/api/admin/contacts/:id/details` | Admin |
| PUT | `/api/admin/contacts/:id` | Admin. Status: `new`, `contacted`, `qualified`, `closed` |
| DELETE | `/api/admin/contacts/:id` | Admin (its pending emails are deleted too) |
| GET | `/api/admin/stats`, `/api/admin/analytics` | Admin |
| GET | `/api/admin/export` | Admin. CSV, safe against spreadsheet formula injection |

## Email outbox

`utils/emailOutbox.js`. Submitting a lead writes the lead plus one `EmailOutbox` row per email
(customer confirmation, admin notification) in one atomic write. A worker inside the server claims
due rows (`FOR UPDATE SKIP LOCKED` with a lease), sends outside any transaction, and retries each
email separately: 30 s, 1, 2, 4 min, ... (capped at 30 min), then marks it `failed` after 5
attempts. Delivery is at-least-once. With `EMAIL_PASS` empty, emails are logged instead of sent.

## Tests

`tests/` runs against a throwaway PostgreSQL in Docker (`docker-compose.yml` at the repo root;
data in tmpfs). `tests/test-env.cjs` refuses any database not named `porsche_test`.
`scripts/measure-submit-latency.mjs` measures submit latency against that same test database.
