-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('EMAIL', 'PHONE', 'NICKNAME', 'PROFILE', 'PLAYER', 'SNS', 'COMPLETE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingStep" "OnboardingStep" NOT NULL DEFAULT 'EMAIL';
