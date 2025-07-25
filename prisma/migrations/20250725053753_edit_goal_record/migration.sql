/*
  Warnings:

  - You are about to drop the column `order` on the `goal_records` table. All the data in the column will be lost.
  - You are about to drop the column `side` on the `goal_records` table. All the data in the column will be lost.
  - Added the required column `scorerSide` to the `goal_records` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "goal_records_matchId_order_idx";

-- AlterTable
ALTER TABLE "goal_records" DROP COLUMN "order",
DROP COLUMN "side",
ADD COLUMN     "isOwnGoal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scorerSide" "TeamSide" NOT NULL;

-- CreateIndex
CREATE INDEX "goal_records_matchId_createdAt_idx" ON "goal_records"("matchId", "createdAt");

-- CreateIndex
CREATE INDEX "goal_records_matchId_isOwnGoal_idx" ON "goal_records"("matchId", "isOwnGoal");
