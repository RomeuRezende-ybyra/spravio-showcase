-- AlterTable
ALTER TABLE "Project" ADD COLUMN "key" TEXT;
ALTER TABLE "Project" ADD COLUMN "description" TEXT;
ALTER TABLE "Project" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Project" ADD COLUMN "contractType" TEXT;
ALTER TABLE "Project" ADD COLUMN "contractValue" DECIMAL(12, 2);
ALTER TABLE "Project" ADD COLUMN "estimatedHours" INTEGER;
ALTER TABLE "Project" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "Project" ADD COLUMN "deadline" TIMESTAMP(3);
