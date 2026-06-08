-- AlterEnum
BEGIN;
CREATE TYPE "OrgRole_new" AS ENUM ('OWNER', 'PROJECT_MANAGER', 'VIEWER');
ALTER TABLE "public"."OrganizationUser" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "OrganizationUser" ALTER COLUMN "role" TYPE "OrgRole_new" USING ("role"::text::"OrgRole_new");
ALTER TYPE "OrgRole" RENAME TO "OrgRole_old";
ALTER TYPE "OrgRole_new" RENAME TO "OrgRole";
DROP TYPE "public"."OrgRole_old";
ALTER TABLE "OrganizationUser" ALTER COLUMN "role" SET DEFAULT 'VIEWER';
COMMIT;

-- AlterTable
ALTER TABLE "OrganizationUser" ALTER COLUMN "role" SET DEFAULT 'VIEWER';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'jira';

-- CreateTable
CREATE TABLE "ProjectBudget" (
    "id" TEXT NOT NULL,
    "totalBudget" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperRate" (
    "id" TEXT NOT NULL,
    "hourlyRate" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "developerId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "DeveloperRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprintHours" (
    "id" TEXT NOT NULL,
    "hoursLogged" DECIMAL(65,30) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sprintId" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,

    CONSTRAINT "SprintHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlackConfig" (
    "id" TEXT NOT NULL,
    "channelId" TEXT,
    "webhookUrl" TEXT,
    "alertTypes" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "SlackConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBudget_projectId_key" ON "ProjectBudget"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperRate_developerId_projectId_key" ON "DeveloperRate"("developerId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "SprintHours_sprintId_developerId_key" ON "SprintHours"("sprintId", "developerId");

-- CreateIndex
CREATE UNIQUE INDEX "SlackConfig_projectId_key" ON "SlackConfig"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectBudget" ADD CONSTRAINT "ProjectBudget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperRate" ADD CONSTRAINT "DeveloperRate_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperRate" ADD CONSTRAINT "DeveloperRate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintHours" ADD CONSTRAINT "SprintHours_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintHours" ADD CONSTRAINT "SprintHours_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlackConfig" ADD CONSTRAINT "SlackConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
