-- CreateEnum
CREATE TYPE "TournamentNewsStatus" AS ENUM ('PUBLISHED', 'HIDDEN');

-- CreateTable
CREATE TABLE "tournament_news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "posterUrl" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "registrationDeadline" TIMESTAMP(3),
    "websiteUrl" TEXT,
    "registrationUrl" TEXT,
    "status" "TournamentNewsStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "tournament_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_news_images" (
    "id" TEXT NOT NULL,
    "tournamentNewsId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_news_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tournament_news_status_isPinned_startDate_idx" ON "tournament_news"("status", "isPinned", "startDate");

-- CreateIndex
CREATE INDEX "tournament_news_status_createdAt_idx" ON "tournament_news"("status", "createdAt");

-- CreateIndex
CREATE INDEX "tournament_news_startDate_endDate_idx" ON "tournament_news"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "tournament_news_registrationDeadline_idx" ON "tournament_news"("registrationDeadline");

-- CreateIndex
CREATE INDEX "tournament_news_isDeleted_status_idx" ON "tournament_news"("isDeleted", "status");

-- CreateIndex
CREATE INDEX "tournament_news_images_tournamentNewsId_order_idx" ON "tournament_news_images"("tournamentNewsId", "order");

-- AddForeignKey
ALTER TABLE "tournament_news" ADD CONSTRAINT "tournament_news_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_news_images" ADD CONSTRAINT "tournament_news_images_tournamentNewsId_fkey" FOREIGN KEY ("tournamentNewsId") REFERENCES "tournament_news"("id") ON DELETE CASCADE ON UPDATE CASCADE;
