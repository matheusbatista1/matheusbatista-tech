-- AlterTable
ALTER TABLE "AIUsageLog" ADD COLUMN     "error" TEXT;

-- AlterTable
ALTER TABLE "CVDownload" ADD COLUMN     "country" TEXT,
ADD COLUMN     "city" TEXT;
