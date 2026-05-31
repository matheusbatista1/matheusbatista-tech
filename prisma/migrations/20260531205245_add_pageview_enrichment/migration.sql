-- AlterTable
ALTER TABLE "PageView" ADD COLUMN     "botName" TEXT,
ADD COLUMN     "botVer" TEXT,
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "browserVer" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "clientTz" TEXT,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "countryName" TEXT,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "deviceModel" TEXT,
ADD COLUMN     "isBot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lon" DOUBLE PRECISION,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "osVer" TEXT,
ADD COLUMN     "refHost" TEXT,
ADD COLUMN     "refPath" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "screenH" INTEGER,
ADD COLUMN     "screenW" INTEGER,
ADD COLUMN     "serverTz" TEXT,
ADD COLUMN     "viewportH" INTEGER,
ADD COLUMN     "viewportW" INTEGER;

-- CreateIndex
CREATE INDEX "PageView_isBot_createdAt_idx" ON "PageView"("isBot", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_countryCode_createdAt_idx" ON "PageView"("countryCode", "createdAt");
