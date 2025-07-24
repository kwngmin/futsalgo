"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export const getMatchData = async (matchId: string, scheduleId: string) => {
  const session = await auth();
  const userId = session?.user?.id;

  // 1. 핵심 데이터 조회
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      schedule: {
        select: {
          id: true,
          place: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          description: true,
          matchType: true,
        },
      },
      homeTeam: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
      awayTeam: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!match?.schedule) {
    return null;
  }

  // 2. 사용자 권한 확인
  let isMember = false;
  let isEditable = false;

  if (userId) {
    const membershipData = await prisma.teamMember.findFirst({
      where: {
        userId,
        teamId: {
          in: [match.homeTeamId, match.awayTeamId],
        },
        status: "APPROVED",
        banned: false,
      },
      select: {
        role: true,
        teamId: true,
      },
    });

    if (membershipData) {
      isMember = true;
      isEditable =
        membershipData.role === "OWNER" || membershipData.role === "MANAGER";
    }
  }

  // 3. 권한에 따른 라인업 데이터 조회
  const lineups = await prisma.lineup.findMany({
    where: { matchId },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          image: true,
          position: true,
          // 멤버인 경우에만 실명 포함
          ...(isMember && { name: true }),
        },
      },
    },
  });

  // 4. 부가 정보 조회
  const [allMatches, goals] = await Promise.all([
    prisma.match.findMany({
      where: { scheduleId },
      select: {
        id: true,
        homeScore: true,
        awayScore: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),

    prisma.goalRecord.findMany({
      where: { matchId },
      include: {
        scorer: {
          select: {
            id: true,
            nickname: true,
            // 멤버인 경우에만 실명 포함
            ...(isMember && { name: true }),
          },
        },
        assist: {
          select: {
            id: true,
            nickname: true,
            // 멤버인 경우에만 실명 포함
            ...(isMember && { name: true }),
          },
        },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  return {
    match,
    lineups,
    allMatches,
    goals,
    matchOrder: allMatches.findIndex((m) => m.id === matchId) + 1,
    permissions: {
      isMember,
      isEditable,
    },
  };
};
