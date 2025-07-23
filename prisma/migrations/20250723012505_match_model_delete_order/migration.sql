/*
  Warnings:

  - You are about to drop the column `order` on the `matches` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "matches_scheduleId_order_key";

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "order";
