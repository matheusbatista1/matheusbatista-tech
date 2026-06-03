-- CreateTable
CREATE TABLE "AdminReadMarker" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminReadMarker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminReadMarker_email_idx" ON "AdminReadMarker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminReadMarker_email_source_key" ON "AdminReadMarker"("email", "source");
