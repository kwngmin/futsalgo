-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "teams_isDeleted_createdAt_idx" ON "teams"("isDeleted", "createdAt");

-- CreateIndex
CREATE INDEX "teams_isDeleted_name_idx" ON "teams"("isDeleted", "name");

-- CreateIndex
CREATE INDEX "teams_deletedAt_idx" ON "teams"("deletedAt");
