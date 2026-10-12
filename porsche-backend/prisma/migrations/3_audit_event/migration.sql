-- Audit log (who changed what, when). Purely additive: one enum type, one table, two indexes.
-- No foreign key to "Contact" on purpose: the history of a deleted lead is kept.

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('lead_created', 'status_changed', 'notes_changed', 'lead_deleted', 'export', 'login_ok', 'login_failed', 'lead_triaged');

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" VARCHAR(120) NOT NULL,
    "action" "AuditAction" NOT NULL,
    "contactId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "meta" JSONB,
    "ip" VARCHAR(64),

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditEvent_contactId_at_idx" ON "AuditEvent"("contactId", "at");

-- CreateIndex
CREATE INDEX "AuditEvent_at_id_idx" ON "AuditEvent"("at", "id");
