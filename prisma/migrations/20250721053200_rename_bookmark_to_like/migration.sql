/*
  Warnings:

  - You are about to drop the `schedule_bookmarks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "schedule_bookmarks" DROP CONSTRAINT "schedule_bookmarks_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_bookmarks" DROP CONSTRAINT "schedule_bookmarks_userId_fkey";

-- DropTable
DROP TABLE "schedule_bookmarks";

-- CreateTable
CREATE TABLE "schedule_likes" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedule_likes_userId_idx" ON "schedule_likes"("userId");

-- CreateIndex
CREATE INDEX "schedule_likes_scheduleId_idx" ON "schedule_likes"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_likes_scheduleId_userId_key" ON "schedule_likes"("scheduleId", "userId");

-- AddForeignKey
ALTER TABLE "schedule_likes" ADD CONSTRAINT "schedule_likes_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_likes" ADD CONSTRAINT "schedule_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
