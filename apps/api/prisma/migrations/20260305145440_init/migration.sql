-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "SprintState" AS ENUM ('FUTURE', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('BACKEND', 'FRONTEND', 'DESIGN', 'DEVOPS');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'TEST', 'UAT', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SyncType" AS ENUM ('FULL', 'SPRINT', 'INCREMENTAL');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationUser" (
    "id" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OrganizationUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSettings" (
    "id" TEXT NOT NULL,
    "jiraBaseUrl" TEXT,
    "jiraEmail" TEXT,
    "jiraApiToken" TEXT,
    "jiraCloudId" TEXT,
    "githubOrg" TEXT,
    "githubToken" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jiraProjectKey" TEXT NOT NULL,
    "jiraBoardId" INTEGER,
    "githubRepo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sprint" (
    "id" TEXT NOT NULL,
    "jiraSprintId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "state" "SprintState" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "completeDate" TIMESTAMP(3),
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "completedPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BurndownPoint" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "baselinePoints" INTEGER NOT NULL,
    "actualPoints" INTEGER NOT NULL,
    "completedPoints" INTEGER NOT NULL,
    "sprintId" TEXT NOT NULL,

    CONSTRAINT "BurndownPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Developer" (
    "id" TEXT NOT NULL,
    "jiraAccountId" TEXT NOT NULL,
    "githubLogin" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDeveloper" (
    "id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "returnRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "backendPoints" INTEGER NOT NULL DEFAULT 0,
    "frontendPoints" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,

    CONSTRAINT "ProjectDeveloper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "jiraIssueId" TEXT NOT NULL,
    "jiraIssueKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "issueType" "IssueType" NOT NULL DEFAULT 'BACKEND',
    "status" "IssueStatus" NOT NULL DEFAULT 'TODO',
    "wasReturned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "sprintId" TEXT,
    "developerId" TEXT,
    "epicId" TEXT,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Epic" (
    "id" TEXT NOT NULL,
    "jiraEpicId" TEXT NOT NULL,
    "jiraEpicKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Epic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "type" "SyncType" NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "errorMsg" TEXT,
    "itemsSynced" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationUser_organizationId_userId_key" ON "OrganizationUser"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSettings_organizationId_key" ON "OrganizationSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Project_organizationId_jiraProjectKey_key" ON "Project"("organizationId", "jiraProjectKey");

-- CreateIndex
CREATE UNIQUE INDEX "Sprint_jiraSprintId_key" ON "Sprint"("jiraSprintId");

-- CreateIndex
CREATE UNIQUE INDEX "BurndownPoint_sprintId_date_key" ON "BurndownPoint"("sprintId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Developer_jiraAccountId_key" ON "Developer"("jiraAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Developer_githubLogin_key" ON "Developer"("githubLogin");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDeveloper_projectId_developerId_key" ON "ProjectDeveloper"("projectId", "developerId");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_jiraIssueId_key" ON "Issue"("jiraIssueId");

-- CreateIndex
CREATE UNIQUE INDEX "Epic_jiraEpicId_key" ON "Epic"("jiraEpicId");

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSettings" ADD CONSTRAINT "OrganizationSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BurndownPoint" ADD CONSTRAINT "BurndownPoint_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDeveloper" ADD CONSTRAINT "ProjectDeveloper_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDeveloper" ADD CONSTRAINT "ProjectDeveloper_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_epicId_fkey" FOREIGN KEY ("epicId") REFERENCES "Epic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Epic" ADD CONSTRAINT "Epic_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncLog" ADD CONSTRAINT "SyncLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
