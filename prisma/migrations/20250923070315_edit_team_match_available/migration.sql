-- CreateEnum
CREATE TYPE "TeamMatchAvailable" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "teamMatch" "TeamMatchAvailable" NOT NULL DEFAULT 'AVAILABLE';
