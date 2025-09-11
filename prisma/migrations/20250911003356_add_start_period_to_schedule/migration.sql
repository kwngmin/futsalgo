-- CreateEnum
CREATE TYPE "Period" AS ENUM ('DAWN', 'MORNING', 'DAY', 'EVENING', 'NIGHT');

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "startPeriod" "Period";

-- CreateIndex
CREATE INDEX "schedules_startPeriod_idx" ON "schedules"("startPeriod");

-- CreateIndex
CREATE INDEX "schedules_date_startPeriod_idx" ON "schedules"("date", "startPeriod");
