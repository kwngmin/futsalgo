-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE', 'KAKAO', 'NAVER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "provider" "Provider";
