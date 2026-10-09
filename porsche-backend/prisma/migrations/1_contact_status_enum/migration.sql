-- VAL-01: Contact.status String -> ContactStatus enum.
--
-- HAND-WRITTEN. `prisma migrate diff` generates
--     ALTER TABLE "Contact" DROP COLUMN "status", ADD COLUMN "status" "ContactStatus" NOT NULL DEFAULT 'new';
-- which would silently reset every lead's status to 'new'. This version converts the column in
-- place and keeps every existing value.

-- 1. Refuse (before changing anything) if a row holds a value the enum can't represent.
DO $$
DECLARE
    bad TEXT;
BEGIN
    SELECT string_agg(DISTINCT "status", ', ') INTO bad
    FROM "Contact"
    WHERE "status" NOT IN ('new', 'contacted', 'qualified', 'closed');

    IF bad IS NOT NULL THEN
        RAISE EXCEPTION 'Contact.status contains values outside (new, contacted, qualified, closed): %. Update those rows first.', bad;
    END IF;
END $$;

-- 2. Create the type and convert the column in place (the status index is rebuilt automatically).
CREATE TYPE "ContactStatus" AS ENUM ('new', 'contacted', 'qualified', 'closed');

ALTER TABLE "Contact" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Contact" ALTER COLUMN "status" TYPE "ContactStatus" USING ("status"::"ContactStatus");
ALTER TABLE "Contact" ALTER COLUMN "status" SET DEFAULT 'new';
