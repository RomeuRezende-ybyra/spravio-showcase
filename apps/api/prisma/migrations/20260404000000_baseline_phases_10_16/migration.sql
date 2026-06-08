-- Baseline: Phases 10-16 consolidation
-- Phase 10: GitLab + Teams
-- Phase 11: Tempo + Clockify
-- Phase 12: AI Forecast
-- Phase 13: Trello
-- Phase 14: ClickUp
-- Phase 15: Linear
-- Phase 16: Asana + Monday

-- ─── ENUM ADDITIONS ────────────────────────────────────────────────────────

ALTER TYPE "SyncType" ADD VALUE IF NOT EXISTS 'GITLAB';
ALTER TYPE "SyncType" ADD VALUE IF NOT EXISTS 'TEMPO';
ALTER TYPE "SyncType" ADD VALUE IF NOT EXISTS 'CLOCKIFY';
ALTER TYPE "SyncType" ADD VALUE IF NOT EXISTS 'TRELLO';
ALTER TYPE "SyncType" ADD VALUE IF NOT EXISTS 'CLICKUP';
ALTER TYPE "SyncType" ADD VALUE IF NOT EXISTS 'LINEAR';
ALTER TYPE "SyncType" ADD VALUE IF NOT EXISTS 'ASANA';
ALTER TYPE "SyncType" ADD VALUE IF NOT EXISTS 'MONDAY';

-- ─── NEW TABLES ────────────────────────────────────────────────────────────

-- TeamsConfig (Phase 10)
CREATE TABLE IF NOT EXISTS "TeamsConfig" (
    "id" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "alertTypes" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "TeamsConfig_pkey" PRIMARY KEY ("id")
);

-- TempoConfig (Phase 11)
CREATE TABLE IF NOT EXISTS "TempoConfig" (
    "id" TEXT NOT NULL,
    "apiToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "TempoConfig_pkey" PRIMARY KEY ("id")
);

-- ClockifyConfig (Phase 11)
CREATE TABLE IF NOT EXISTS "ClockifyConfig" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ClockifyConfig_pkey" PRIMARY KEY ("id")
);

-- DeliveryForecast (Phase 12)
CREATE TABLE IF NOT EXISTS "DeliveryForecast" (
    "id" TEXT NOT NULL,
    "onTimeProbability" INTEGER NOT NULL,
    "predictedEndDate" TIMESTAMP(3),
    "confidence" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "inputSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "DeliveryForecast_pkey" PRIMARY KEY ("id")
);

-- ─── NEW COLUMNS: Project ──────────────────────────────────────────────────

ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "gitlabRepo" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "trelloBoardId" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "clickupSpaceId" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "linearTeamId" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "asanaProjectId" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "mondayBoardId" TEXT;

-- ─── NEW COLUMNS: Sprint ────────────────────────────────────────���──────────

ALTER TABLE "Sprint" ADD COLUMN IF NOT EXISTS "trelloListId" TEXT;
ALTER TABLE "Sprint" ADD COLUMN IF NOT EXISTS "clickupSprintId" TEXT;
ALTER TABLE "Sprint" ADD COLUMN IF NOT EXISTS "linearCycleId" TEXT;
ALTER TABLE "Sprint" ADD COLUMN IF NOT EXISTS "asanaSectionId" TEXT;
ALTER TABLE "Sprint" ADD COLUMN IF NOT EXISTS "mondayGroupId" TEXT;

-- ─── NEW COLUMNS: Developer ────────────────────────────────────────────────

ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "gitlabUserId" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "trelloMemberId" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "clickupUserId" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "linearUserId" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "asanaUserId" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "mondayUserId" TEXT;

-- ─── NEW COLUMNS: Issue ────────────────────────────────────────────────────

ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "trelloCardId" TEXT;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "clickupTaskId" TEXT;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "linearIssueId" TEXT;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "asanaTaskId" TEXT;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "mondayItemId" TEXT;

-- ─── NEW COLUMN: SprintHours ───────────────────────────────────────────────

ALTER TABLE "SprintHours" ADD COLUMN IF NOT EXISTS "externalId" TEXT;

-- ─── UNIQUE INDEXES: New tables ────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "TeamsConfig_projectId_key" ON "TeamsConfig"("projectId");
CREATE UNIQUE INDEX IF NOT EXISTS "TempoConfig_projectId_key" ON "TempoConfig"("projectId");
CREATE UNIQUE INDEX IF NOT EXISTS "ClockifyConfig_projectId_key" ON "ClockifyConfig"("projectId");

-- ─── INDEX: DeliveryForecast ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "DeliveryForecast_projectId_createdAt_idx" ON "DeliveryForecast"("projectId", "createdAt");

-- ─── UNIQUE INDEXES: Sprint source IDs ─────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "Sprint_trelloListId_key" ON "Sprint"("trelloListId");
CREATE UNIQUE INDEX IF NOT EXISTS "Sprint_clickupSprintId_key" ON "Sprint"("clickupSprintId");
CREATE UNIQUE INDEX IF NOT EXISTS "Sprint_linearCycleId_key" ON "Sprint"("linearCycleId");
CREATE UNIQUE INDEX IF NOT EXISTS "Sprint_asanaSectionId_key" ON "Sprint"("asanaSectionId");
CREATE UNIQUE INDEX IF NOT EXISTS "Sprint_mondayGroupId_key" ON "Sprint"("mondayGroupId");

-- ─── UNIQUE INDEXES: Developer source IDs ──────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "Developer_gitlabUserId_key" ON "Developer"("gitlabUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "Developer_trelloMemberId_key" ON "Developer"("trelloMemberId");
CREATE UNIQUE INDEX IF NOT EXISTS "Developer_clickupUserId_key" ON "Developer"("clickupUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "Developer_linearUserId_key" ON "Developer"("linearUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "Developer_asanaUserId_key" ON "Developer"("asanaUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "Developer_mondayUserId_key" ON "Developer"("mondayUserId");

-- ─── UNIQUE INDEXES: Issue source IDs ──────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "Issue_trelloCardId_key" ON "Issue"("trelloCardId");
CREATE UNIQUE INDEX IF NOT EXISTS "Issue_clickupTaskId_key" ON "Issue"("clickupTaskId");
CREATE UNIQUE INDEX IF NOT EXISTS "Issue_linearIssueId_key" ON "Issue"("linearIssueId");
CREATE UNIQUE INDEX IF NOT EXISTS "Issue_asanaTaskId_key" ON "Issue"("asanaTaskId");
CREATE UNIQUE INDEX IF NOT EXISTS "Issue_mondayItemId_key" ON "Issue"("mondayItemId");

-- ─���─ ALTER UNIQUE: SprintHours (add source to unique constraint) ───────────

-- Drop old unique constraint (sprintId + developerId only)
DROP INDEX IF EXISTS "SprintHours_sprintId_developerId_key";

-- Create new unique constraint (sprintId + developerId + source)
CREATE UNIQUE INDEX IF NOT EXISTS "SprintHours_sprintId_developerId_source_key" ON "SprintHours"("sprintId", "developerId", "source");

-- ─── FOREIGN KEYS: New tables ──────────────────────────────────────────────

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TeamsConfig_projectId_fkey') THEN
        ALTER TABLE "TeamsConfig" ADD CONSTRAINT "TeamsConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TempoConfig_projectId_fkey') THEN
        ALTER TABLE "TempoConfig" ADD CONSTRAINT "TempoConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClockifyConfig_projectId_fkey') THEN
        ALTER TABLE "ClockifyConfig" ADD CONSTRAINT "ClockifyConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DeliveryForecast_projectId_fkey') THEN
        ALTER TABLE "DeliveryForecast" ADD CONSTRAINT "DeliveryForecast_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
