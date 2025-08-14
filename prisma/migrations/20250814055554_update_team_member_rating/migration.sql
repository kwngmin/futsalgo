-- CreateTable
CREATE TABLE "team_member_ratings" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "shooting" INTEGER NOT NULL DEFAULT 1,
    "passing" INTEGER NOT NULL DEFAULT 1,
    "stamina" INTEGER NOT NULL DEFAULT 1,
    "physical" INTEGER NOT NULL DEFAULT 1,
    "dribbling" INTEGER NOT NULL DEFAULT 1,
    "defense" INTEGER NOT NULL DEFAULT 1,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_member_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_member_ratings_teamId_toUserId_idx" ON "team_member_ratings"("teamId", "toUserId");

-- CreateIndex
CREATE INDEX "team_member_ratings_teamId_periodYear_periodMonth_idx" ON "team_member_ratings"("teamId", "periodYear", "periodMonth");

-- CreateIndex
CREATE INDEX "team_member_ratings_toUserId_periodYear_idx" ON "team_member_ratings"("toUserId", "periodYear");

-- CreateIndex
CREATE INDEX "team_member_ratings_fromUserId_idx" ON "team_member_ratings"("fromUserId");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_ratings_teamId_fromUserId_toUserId_periodYear_p_key" ON "team_member_ratings"("teamId", "fromUserId", "toUserId", "periodYear", "periodMonth");

-- AddForeignKey
ALTER TABLE "team_member_ratings" ADD CONSTRAINT "team_member_ratings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member_ratings" ADD CONSTRAINT "team_member_ratings_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member_ratings" ADD CONSTRAINT "team_member_ratings_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
