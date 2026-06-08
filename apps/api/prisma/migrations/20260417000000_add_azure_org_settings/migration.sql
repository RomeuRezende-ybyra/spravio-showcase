-- AlterTable: OrganizationSettings
-- Add Azure DevOps organization settings fields
ALTER TABLE "OrganizationSettings" ADD COLUMN "azureOrganization" TEXT;
ALTER TABLE "OrganizationSettings" ADD COLUMN "azurePersonalAccessToken" TEXT;
