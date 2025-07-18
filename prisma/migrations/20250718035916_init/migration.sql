-- CreateEnum
CREATE TYPE "Foot" AS ENUM ('LEFT', 'RIGHT', 'BOTH');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NORMAL', 'INJURED');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('PIVO', 'ALA', 'FIXO', 'GOLEIRO');

-- CreateEnum
CREATE TYPE "TeamMemberStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'LEAVE');

-- CreateEnum
CREATE TYPE "TeamMemberRole" AS ENUM ('OWNER', 'MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "BoardType" AS ENUM ('GENERAL', 'NOTICE');

-- CreateEnum
CREATE TYPE "TeamGender" AS ENUM ('MALE', 'FEMALE', 'MIXED');

-- CreateEnum
CREATE TYPE "ActivityFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'IRREGULAR');

-- CreateEnum
CREATE TYPE "PlayerBackground" AS ENUM ('NON_PROFESSIONAL', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "PlayerSkillLevel" AS ENUM ('BEGINNER', 'AMATEUR', 'ACE', 'SEMIPRO');

-- CreateEnum
CREATE TYPE "TeamLevel" AS ENUM ('VERY_LOW', 'LOW', 'MID', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISBANDED');

-- CreateEnum
CREATE TYPE "RecruitmentStatus" AS ENUM ('RECRUITING', 'NOT_RECRUITING');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('SQUAD', 'TEAM');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'READY', 'REJECTED', 'PLAY');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "TeamSide" AS ENUM ('HOME', 'AWAY', 'UNDECIDED');

-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('HOST', 'INVITED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('UNDECIDED', 'ATTENDING', 'NOT_ATTENDING');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "nickname" TEXT,
    "phone" TEXT,
    "image" TEXT,
    "foot" "Foot",
    "gender" "Gender",
    "birthDate" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "condition" "Condition" NOT NULL DEFAULT 'NORMAL',
    "playerBackground" "PlayerBackground" NOT NULL DEFAULT 'NON_PROFESSIONAL',
    "skillLevel" "PlayerSkillLevel" NOT NULL DEFAULT 'BEGINNER',
    "position" "Position",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_follows" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "description" TEXT,
    "status" "TeamStatus" NOT NULL DEFAULT 'ACTIVE',
    "recruitmentStatus" "RecruitmentStatus" NOT NULL DEFAULT 'RECRUITING',
    "gender" "TeamGender" NOT NULL,
    "level" "TeamLevel" NOT NULL DEFAULT 'MID',
    "activityFrequency" "ActivityFrequency" NOT NULL DEFAULT 'WEEKLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "TeamMemberStatus" NOT NULL DEFAULT 'PENDING',
    "role" "TeamMemberRole" NOT NULL DEFAULT 'MEMBER',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bannedAt" TIMESTAMP(3),

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "place" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "matchType" "MatchType" NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "enableAttendanceVote" BOOLEAN NOT NULL DEFAULT false,
    "attendanceDeadline" TIMESTAMP(3),
    "city" TEXT,
    "district" TEXT,
    "createdById" TEXT NOT NULL,
    "hostTeamId" TEXT NOT NULL,
    "invitedTeamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_photos" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_bookmarks" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_attendances" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'UNDECIDED',
    "teamType" "TeamType" NOT NULL DEFAULT 'HOST',
    "votedAt" TIMESTAMP(3),
    "mvpToUserId" TEXT,
    "mvpReceived" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_match_invitations" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "invitedTeamId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_match_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "isEnded" BOOLEAN NOT NULL DEFAULT false,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineups" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" "TeamSide" NOT NULL,

    CONSTRAINT "lineups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_records" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "scorerId" TEXT NOT NULL,
    "assistId" TEXT,
    "side" "TeamSide" NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_comments" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "teamId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "BoardType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "user_follows_followerId_idx" ON "user_follows"("followerId");

-- CreateIndex
CREATE INDEX "user_follows_followingId_idx" ON "user_follows"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "user_follows_followerId_followingId_key" ON "user_follows"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "team_follows_userId_idx" ON "team_follows"("userId");

-- CreateIndex
CREATE INDEX "team_follows_teamId_idx" ON "team_follows"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_follows_teamId_userId_key" ON "team_follows"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_code_key" ON "teams"("code");

-- CreateIndex
CREATE INDEX "teams_city_district_idx" ON "teams"("city", "district");

-- CreateIndex
CREATE INDEX "teams_level_gender_idx" ON "teams"("level", "gender");

-- CreateIndex
CREATE INDEX "teams_status_recruitmentStatus_idx" ON "teams"("status", "recruitmentStatus");

-- CreateIndex
CREATE INDEX "teams_name_idx" ON "teams"("name");

-- CreateIndex
CREATE INDEX "teams_createdAt_idx" ON "teams"("createdAt");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "team_members"("userId", "status");

-- CreateIndex
CREATE INDEX "team_status_idx" ON "team_members"("teamId", "status");

-- CreateIndex
CREATE INDEX "team_role_idx" ON "team_members"("teamId", "role");

-- CreateIndex
CREATE INDEX "team_role_status_idx" ON "team_members"("teamId", "role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "team_user_unique" ON "team_members"("teamId", "userId");

-- CreateIndex
CREATE INDEX "schedules_date_status_idx" ON "schedules"("date", "status");

-- CreateIndex
CREATE INDEX "schedules_hostTeamId_idx" ON "schedules"("hostTeamId");

-- CreateIndex
CREATE INDEX "schedules_invitedTeamId_idx" ON "schedules"("invitedTeamId");

-- CreateIndex
CREATE INDEX "schedules_year_idx" ON "schedules"("year");

-- CreateIndex
CREATE INDEX "schedules_city_district_idx" ON "schedules"("city", "district");

-- CreateIndex
CREATE INDEX "schedules_attendanceDeadline_idx" ON "schedules"("attendanceDeadline");

-- CreateIndex
CREATE INDEX "schedule_photos_scheduleId_idx" ON "schedule_photos"("scheduleId");

-- CreateIndex
CREATE INDEX "schedule_photos_uploaderId_idx" ON "schedule_photos"("uploaderId");

-- CreateIndex
CREATE INDEX "schedule_photos_scheduleId_createdAt_idx" ON "schedule_photos"("scheduleId", "createdAt");

-- CreateIndex
CREATE INDEX "schedule_bookmarks_userId_idx" ON "schedule_bookmarks"("userId");

-- CreateIndex
CREATE INDEX "schedule_bookmarks_scheduleId_idx" ON "schedule_bookmarks"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_bookmarks_scheduleId_userId_key" ON "schedule_bookmarks"("scheduleId", "userId");

-- CreateIndex
CREATE INDEX "schedule_attendances_scheduleId_attendanceStatus_idx" ON "schedule_attendances"("scheduleId", "attendanceStatus");

-- CreateIndex
CREATE INDEX "schedule_attendances_scheduleId_teamType_idx" ON "schedule_attendances"("scheduleId", "teamType");

-- CreateIndex
CREATE INDEX "schedule_attendances_scheduleId_votedAt_idx" ON "schedule_attendances"("scheduleId", "votedAt");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_attendances_scheduleId_userId_key" ON "schedule_attendances"("scheduleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "team_match_invitations_scheduleId_key" ON "team_match_invitations"("scheduleId");

-- CreateIndex
CREATE INDEX "team_match_invitations_invitedTeamId_status_idx" ON "team_match_invitations"("invitedTeamId", "status");

-- CreateIndex
CREATE INDEX "matches_scheduleId_idx" ON "matches"("scheduleId");

-- CreateIndex
CREATE INDEX "matches_isEnded_idx" ON "matches"("isEnded");

-- CreateIndex
CREATE INDEX "matches_homeTeamId_idx" ON "matches"("homeTeamId");

-- CreateIndex
CREATE INDEX "matches_awayTeamId_idx" ON "matches"("awayTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "matches_scheduleId_order_key" ON "matches"("scheduleId", "order");

-- CreateIndex
CREATE INDEX "lineups_matchId_side_idx" ON "lineups"("matchId", "side");

-- CreateIndex
CREATE UNIQUE INDEX "lineups_matchId_userId_key" ON "lineups"("matchId", "userId");

-- CreateIndex
CREATE INDEX "goal_records_matchId_idx" ON "goal_records"("matchId");

-- CreateIndex
CREATE INDEX "goal_records_scorerId_idx" ON "goal_records"("scorerId");

-- CreateIndex
CREATE INDEX "schedule_comments_scheduleId_createdAt_idx" ON "schedule_comments"("scheduleId", "createdAt");

-- CreateIndex
CREATE INDEX "schedule_comments_parentId_idx" ON "schedule_comments"("parentId");

-- CreateIndex
CREATE INDEX "schedule_comments_scheduleId_parentId_createdAt_idx" ON "schedule_comments"("scheduleId", "parentId", "createdAt");

-- CreateIndex
CREATE INDEX "posts_teamId_type_idx" ON "posts"("teamId", "type");

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");

-- CreateIndex
CREATE INDEX "posts_createdAt_idx" ON "posts"("createdAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_follows" ADD CONSTRAINT "team_follows_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_follows" ADD CONSTRAINT "team_follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_hostTeamId_fkey" FOREIGN KEY ("hostTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_invitedTeamId_fkey" FOREIGN KEY ("invitedTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_photos" ADD CONSTRAINT "schedule_photos_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_photos" ADD CONSTRAINT "schedule_photos_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_bookmarks" ADD CONSTRAINT "schedule_bookmarks_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_bookmarks" ADD CONSTRAINT "schedule_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_attendances" ADD CONSTRAINT "schedule_attendances_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_attendances" ADD CONSTRAINT "schedule_attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_match_invitations" ADD CONSTRAINT "team_match_invitations_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_match_invitations" ADD CONSTRAINT "team_match_invitations_invitedTeamId_fkey" FOREIGN KEY ("invitedTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_records" ADD CONSTRAINT "goal_records_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_records" ADD CONSTRAINT "goal_records_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_records" ADD CONSTRAINT "goal_records_assistId_fkey" FOREIGN KEY ("assistId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_comments" ADD CONSTRAINT "schedule_comments_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_comments" ADD CONSTRAINT "schedule_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_comments" ADD CONSTRAINT "schedule_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "schedule_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
