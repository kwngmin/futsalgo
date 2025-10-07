/*
  Warnings:

  - The `type` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `boardId` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BoardCategory" AS ENUM ('FREE', 'TEAM');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('GENERAL', 'NOTICE');

-- DropIndex
DROP INDEX "posts_createdAt_idx";

-- DropIndex
DROP INDEX "posts_teamId_type_idx";

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "boardId" TEXT NOT NULL,
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "type",
ADD COLUMN     "type" "PostType" NOT NULL DEFAULT 'GENERAL';

-- DropEnum
DROP TYPE "BoardType";

-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" "BoardCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requireAuth" BOOLEAN NOT NULL DEFAULT true,
    "allowAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "teamId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_attachments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "boards_slug_key" ON "boards"("slug");

-- CreateIndex
CREATE INDEX "boards_category_isActive_idx" ON "boards"("category", "isActive");

-- CreateIndex
CREATE INDEX "boards_teamId_idx" ON "boards"("teamId");

-- CreateIndex
CREATE INDEX "boards_slug_idx" ON "boards"("slug");

-- CreateIndex
CREATE INDEX "boards_order_idx" ON "boards"("order");

-- CreateIndex
CREATE INDEX "post_comments_postId_createdAt_idx" ON "post_comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "post_comments_parentId_idx" ON "post_comments"("parentId");

-- CreateIndex
CREATE INDEX "post_likes_userId_idx" ON "post_likes"("userId");

-- CreateIndex
CREATE INDEX "post_likes_postId_idx" ON "post_likes"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_postId_userId_key" ON "post_likes"("postId", "userId");

-- CreateIndex
CREATE INDEX "post_attachments_postId_idx" ON "post_attachments"("postId");

-- CreateIndex
CREATE INDEX "posts_boardId_createdAt_idx" ON "posts"("boardId", "createdAt");

-- CreateIndex
CREATE INDEX "posts_boardId_isPinned_createdAt_idx" ON "posts"("boardId", "isPinned", "createdAt");

-- CreateIndex
CREATE INDEX "posts_teamId_idx" ON "posts"("teamId");

-- CreateIndex
CREATE INDEX "posts_boardId_type_idx" ON "posts"("boardId", "type");

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "post_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_attachments" ADD CONSTRAINT "post_attachments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
