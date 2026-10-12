-- AI lead triage (Phase 10). Purely additive: two enum types, one table, its indexes and the
-- cascade from "Contact". Existing leads get no job (no surprise bulk calls to the AI API).

-- CreateEnum
CREATE TYPE "TriageStatus" AS ENUM ('pending', 'done', 'failed');

-- CreateEnum
CREATE TYPE "LeadScore" AS ENUM ('hot', 'warm', 'cold');

-- CreateTable
CREATE TABLE "LeadTriage" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "status" "TriageStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),
    "score" "LeadScore",
    "summary" VARCHAR(200),
    "nextStep" VARCHAR(200),
    "model" VARCHAR(80),
    "lastError" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadTriage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadTriage_contactId_key" ON "LeadTriage"("contactId");

-- CreateIndex
CREATE INDEX "LeadTriage_status_nextAttemptAt_idx" ON "LeadTriage"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "LeadTriage_score_idx" ON "LeadTriage"("score");

-- AddForeignKey
ALTER TABLE "LeadTriage" ADD CONSTRAINT "LeadTriage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
