/*
  Warnings:

  - A unique constraint covering the columns `[order]` on the table `matches` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "matches_order_idx";

-- AlterTable
ALTER TABLE "matches" ALTER COLUMN "order" DROP DEFAULT;
DROP SEQUENCE "matches_order_seq";

-- CreateIndex
CREATE UNIQUE INDEX "matches_order_key" ON "matches"("order");
