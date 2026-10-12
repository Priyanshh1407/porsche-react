# Backend (porsche-backend)

Express 5 · Prisma 7 (pg adapter) · PostgreSQL · nodemailer. Project overview: [root README](../README.md).

```bash
cp .env.example .env         # see the comments in it
npm install                  # postinstall runs `prisma generate`
npx prisma migrate deploy    # apply migrations (see prisma/MIGRATIONS.md)
npm start                    # http://localhost:5000
npm test                     # starts its own throwaway PostgreSQL; no Docker needed
```

The server refuses to start without `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL` and
`ADMIN_PASSWORD`, or if the database doesn't answer. It shuts down cleanly on SIGTERM/SIGINT.

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | The process is up (never touches the DB) |
| GET | `/ready` | The database answers (use for load-balancer health checks) |
| POST | `/api/contact/submit` | Validated; 5 per hour per IP; saves the lead and its emails atomically |
| GET | `/api/contact/models` | Model options for the form |
| POST | `/api/admin/login` | Returns a JWT; 5 failed attempts per 15 min per IP |
| GET | `/api/admin/contacts` | Admin. Server-side search (`q`), filters (`status`, `inquiryType`, AI `score`), paging (`page`, `limit`); each lead carries its AI `triage` |
| GET | `/api/admin/contacts/:id/details` | Admin |
| PUT | `/api/admin/contacts/:id` | Admin. Status: `new`, `contacted`, `qualified`, `closed` |
| DELETE | `/api/admin/contacts/:id` | Admin (its pending emails are deleted too) |
| GET | `/api/admin/stats`, `/api/admin/analytics` | Admin |
| GET | `/api/admin/export` | Admin. CSV, safe against spreadsheet formula injection |
| GET | `/api/admin/contacts/:id/timeline` | Admin. The lead's audit events and emails, oldest first (works for deleted leads) |
| POST | `/api/admin/events/ticket` | Admin. A single-use ticket (30 s) for the live-event stream |
| GET | `/api/admin/events?ticket=` | Live events (Server-Sent Events): `lead.created`, `lead.updated`, `lead.deleted`, `lead.triaged` |
| GET | `/api/admin/audit` | Admin. Whole audit log, newest first; keyset paging with `limit` and `cursor` (`nextCursor`) |

## Audit log

`utils/audit.js`, table `AuditEvent`. Every lead creation, status or notes change, deletion, CSV
export and admin login (ok or failed) writes one event: who (`admin:<email>`, `public`, `ai`), what,
and a before/after diff. Changes write their event **in the same transaction** (`prisma.$transaction`),
so a rolled-back change leaves no event and an event that can't be written rolls the change back.
No personal data is copied into it (lead events hold status, inquiry type, model, source; logins hold
the email tried, never the password). There is no foreign key to `Contact`, so a deleted lead's
history stays. The admin's lead details show it as a timeline.

## Live admin notifications

`utils/events.js`, `routes/events.js`. Changes call `publish(tx, type, data)`, which runs
`pg_notify` **inside the change's transaction**: Postgres delivers it only on commit, in commit
order, to every listening connection, so several API instances all see every event. Each process
keeps one `LISTEN` connection (reconnecting with backoff) and fans events out to its open SSE
streams. EventSource can't send a JWT and a JWT in a URL ends up in logs, so the dashboard first
trades it for a ticket: random, single use, valid 30 s, stored hashed in memory (with several
instances, use sticky sessions or a shared ticket store). Streams send a heartbeat every 25 s, end
when the admin's JWT expires, and are ended on shutdown (the SIGTERM check holds one open).

## AI lead triage (Gemini, optional)

`services/ai/triage.js`, `services/ai/client.js`, table `LeadTriage`. Every lead gets a triage job
in the lead's own transaction. A worker claims due jobs (lease + `FOR UPDATE SKIP LOCKED`, as in the
email outbox) and asks Google Gemini (`gemini-3.8-flash`, override with `GEMINI_MODEL`) for
**structured JSON** (`responseJsonSchema`): a score (hot / warm / cold), a one-line summary and a
next step. The answer is validated again in code; invalid output or an API error is never stored,
the job retries with backoff (4 attempts). The result is stored with an audit event (actor `ai`)
and a live `lead.triaged` notification. The model sees the enquiry (type, model, message,
preferences), never the visitor's name, email, phone or IP, and is told to ignore instructions
inside the message.

**Turning it on:** set `GEMINI_API_KEY` in `.env` and restart. Without a key nothing calls the API;
jobs stay queued (the admin shows "AI off") and are triaged once a key is set. Leads created before
this feature have no job. Tests always use a scripted fake client, never the real API.

## Email outbox

`utils/emailOutbox.js`. Submitting a lead writes the lead plus one `EmailOutbox` row per email
(customer confirmation, admin notification) in one atomic write. A worker inside the server claims
due rows (`FOR UPDATE SKIP LOCKED` with a lease), sends outside any transaction, and retries each
email separately: 30 s, 1, 2, 4 min, ... (capped at 30 min), then marks it `failed` after 5
attempts. Delivery is at-least-once. With `EMAIL_PASS` empty, emails are logged instead of sent.

## Tests

`tests/` runs against a throwaway, real PostgreSQL chosen by `scripts/test-db.mjs`:
`DATABASE_URL_TEST` if set, else the Docker test-db on :5433 if it is already running
(`npm run test:db:up`, optional), else an **embedded PostgreSQL 17** started in a temp folder for the
run and removed afterwards (no Docker, no admin rights). `npm run test:db` keeps one running for
manual work. `tests/test-env.cjs` refuses any database not named `porsche_test`.
`scripts/measure-submit-latency.mjs` measures submit latency against the same kind of test database.
