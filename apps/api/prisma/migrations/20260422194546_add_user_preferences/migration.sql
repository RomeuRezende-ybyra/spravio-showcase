-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateFormat" TEXT DEFAULT 'DD/MM/YYYY',
ADD COLUMN     "language" TEXT DEFAULT 'en',
ADD COLUMN     "theme" TEXT DEFAULT 'dark',
ADD COLUMN     "timezone" TEXT DEFAULT 'America/Sao_Paulo';
