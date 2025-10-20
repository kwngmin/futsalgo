/*
  Warnings:

  - Added the required column `skillLevel` to the `team_member_ratings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "team_member_ratings" ADD COLUMN     "skillLevel" "PlayerSkillLevel" NOT NULL;
