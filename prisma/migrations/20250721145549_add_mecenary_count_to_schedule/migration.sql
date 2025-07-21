-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "hostTeamMercenaryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "invitedTeamMercenaryCount" INTEGER DEFAULT 0;
