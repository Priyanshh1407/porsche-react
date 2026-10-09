# Database migrations

Schema changes go through `prisma/migrations/`. **Do not use `prisma db push` any more**: it
changes the database without recording a migration, and the next `migrate deploy` then refuses
to run.

| Migration | What it does |
|---|---|
| `0_init` | The schema as it was created by `db push` before migrations existed (baseline). |
| `1_contact_status_enum` | `Contact.status` text → `ContactStatus` enum (`new`, `contacted`, `qualified`, `closed`). **Hand-written** to convert the column in place: Prisma's generated SQL drops and re-adds the column, which would reset every lead to `new`. It refuses to run (and changes nothing) if a row holds any other value. |

## Fresh database (new machine, CI, new deployment)

```bash
cd porsche-backend
npx prisma migrate deploy      # applies 0_init and 1_contact_status_enum
```

## Existing database created with `db push` (one-time upgrade)

This is the path rehearsed on the Docker test database in Phase 2, including a bad-data failure
and its recovery. Run it yourself against your own database (`DATABASE_URL` in `.env`).

1. **Back up first** (recommended):
   ```bash
   pg_dump "<your DATABASE_URL>" > porsche-backup-before-migrations.sql
   ```
2. **Check the status values.** Anything other than `new`, `contacted`, `qualified`, `closed` must
   be updated first (the migration refuses otherwise):
   ```sql
   SELECT status, COUNT(*) FROM "Contact" GROUP BY status;
   ```
3. **Mark the baseline as already applied.** Your tables already exist, so `0_init` must not run:
   ```bash
   npx prisma migrate resolve --applied 0_init
   ```
4. **Apply the enum migration:**
   ```bash
   npx prisma migrate deploy
   ```
5. **Verify** (both should report nothing to do):
   ```bash
   npx prisma migrate status
   npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
   ```

### If step 4 fails with "Contact.status contains values outside ..."
Nothing was changed. Fix those rows, mark the failed attempt as rolled back, and deploy again:
```sql
UPDATE "Contact" SET status = 'new' WHERE status NOT IN ('new', 'contacted', 'qualified', 'closed');
```
```bash
npx prisma migrate resolve --rolled-back 1_contact_status_enum
npx prisma migrate deploy
```

## Changing the schema from now on
```bash
npx prisma migrate dev --name <describe-the-change>   # against a development database only
```
Read the generated SQL before committing it. For column type changes, Prisma may generate
`DROP COLUMN` + `ADD COLUMN`, which loses data; write the conversion by hand (see
`1_contact_status_enum`).
