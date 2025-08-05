/*
  Warnings:

  - Made the column `isOwnGoal` on table `goal_records` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "goal_records" ALTER COLUMN "isOwnGoal" SET NOT NULL,
ALTER COLUMN "isOwnGoal" SET DEFAULT false;
