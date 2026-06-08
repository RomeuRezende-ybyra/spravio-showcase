-- AlterEnum
ALTER TYPE "SyncType" ADD VALUE 'GITHUB';

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "linkedPRNumber" INTEGER,
ADD COLUMN     "linkedPRStatus" TEXT;
