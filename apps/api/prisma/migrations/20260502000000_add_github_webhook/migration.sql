-- CreateTable
CREATE TABLE "GitHubWebhookConfig" (
    "id" TEXT NOT NULL,
    "webhookSecret" TEXT NOT NULL,
    "githubWebhookId" INTEGER,
    "events" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastEventAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "GitHubWebhookConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubWebhookEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "action" TEXT,
    "deliveryId" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "GitHubWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubWebhookConfig_organizationId_key" ON "GitHubWebhookConfig"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubWebhookEvent_deliveryId_key" ON "GitHubWebhookEvent"("deliveryId");

-- CreateIndex
CREATE INDEX "GitHubWebhookEvent_organizationId_createdAt_idx" ON "GitHubWebhookEvent"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "GitHubWebhookConfig" ADD CONSTRAINT "GitHubWebhookConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
