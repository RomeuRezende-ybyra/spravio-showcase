-- AlterEnum
ALTER TYPE "SyncType" ADD VALUE 'AZURE';

-- AlterTable: Project
ALTER TABLE "Project" ADD COLUMN "azureProjectId" TEXT;
ALTER TABLE "Project" ALTER COLUMN "jiraProjectKey" DROP NOT NULL;

-- AlterTable: Sprint
ALTER TABLE "Sprint" ADD COLUMN "azureIterationId" TEXT;
ALTER TABLE "Sprint" ALTER COLUMN "jiraSprintId" DROP NOT NULL;

-- AlterTable: Developer
ALTER TABLE "Developer" ADD COLUMN "azureUserId" TEXT;
ALTER TABLE "Developer" ALTER COLUMN "jiraAccountId" DROP NOT NULL;

-- AlterTable: Issue
ALTER TABLE "Issue" ADD COLUMN "azureWorkItemId" INTEGER;
ALTER TABLE "Issue" ALTER COLUMN "jiraIssueId" DROP NOT NULL;
ALTER TABLE "Issue" ALTER COLUMN "jiraIssueKey" DROP NOT NULL;

-- AlterTable: Epic
ALTER TABLE "Epic" ADD COLUMN "azureEpicId" INTEGER;
ALTER TABLE "Epic" ALTER COLUMN "jiraEpicId" DROP NOT NULL;
ALTER TABLE "Epic" ALTER COLUMN "jiraEpicKey" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Developer_azureUserId_key" ON "Developer"("azureUserId");
CREATE UNIQUE INDEX "Epic_azureEpicId_key" ON "Epic"("azureEpicId");
CREATE UNIQUE INDEX "Issue_azureWorkItemId_key" ON "Issue"("azureWorkItemId");
CREATE UNIQUE INDEX "Sprint_azureIterationId_key" ON "Sprint"("azureIterationId");
CREATE UNIQUE INDEX "Project_organizationId_azureProjectId_key" ON "Project"("organizationId", "azureProjectId");
