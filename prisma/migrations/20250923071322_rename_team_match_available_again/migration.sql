/*
  Warnings:

  - You are about to drop the column `teamMatch` on the `teams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "teamMatch",
ADD COLUMN     "teamMatchAvailable" "TeamMatchAvailable" NOT NULL DEFAULT 'AVAILABLE';
