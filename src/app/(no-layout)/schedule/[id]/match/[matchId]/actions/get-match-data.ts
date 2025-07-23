"use server";

import { prisma } from "@/shared/lib/prisma";

export const getMatchData = async (matchId: string, scheduleId: string) => {
  // 1. 핵심 데이터는 한 번의 쿼리로
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
        },
      },
      lineups: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nickname: true,
              image: true,
              position: true,
            },
          },
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

  // 2. 부가 정보는 필요시에만 별도 쿼리 (캐시 활용 가능)
  const [allMatches, goals] = await Promise.all([
    // 매치 목록 (자주 변하지 않으므로 캐시 가능)
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

    // 골 정보 (실시간성이 중요하므로 별도 조회)
    prisma.goalRecord.findMany({
      where: { matchId },
      include: {
        scorer: {
          select: { id: true, name: true, nickname: true },
        },
        assist: {
          select: { id: true, name: true, nickname: true },
        },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  return {
    match,
    allMatches,
    goals,
    matchOrder: allMatches.findIndex((m) => m.id === matchId) + 1,
  };
};
