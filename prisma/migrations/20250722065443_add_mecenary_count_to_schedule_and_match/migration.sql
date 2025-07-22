/*
  Warnings:

  - You are about to drop the column `isEnded` on the `matches` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "goal_records" DROP CONSTRAINT "goal_records_scorerId_fkey";

-- DropIndex
DROP INDEX "matches_isEnded_idx";

-- AlterTable
ALTER TABLE "goal_records" ADD COLUMN     "isAssistedByMercenary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isScoredByMercenary" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "scorerId" DROP NOT NULL;

-- AlterTable
CREATE SEQUENCE matches_order_seq;
ALTER TABLE "matches" DROP COLUMN "isEnded",
ADD COLUMN     "awayTeamMercenaryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "homeTeamMercenaryCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "order" SET DEFAULT nextval('matches_order_seq');
ALTER SEQUENCE matches_order_seq OWNED BY "matches"."order";

-- CreateIndex
CREATE INDEX "goal_records_assistId_idx" ON "goal_records"("assistId");

-- CreateIndex
CREATE INDEX "goal_records_matchId_order_idx" ON "goal_records"("matchId", "order");

-- CreateIndex
CREATE INDEX "matches_order_idx" ON "matches"("order");

-- AddForeignKey
ALTER TABLE "goal_records" ADD CONSTRAINT "goal_records_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
