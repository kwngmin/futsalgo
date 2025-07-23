import { Prisma } from "@prisma/client";

// 1. Match 쿼리 validator 정의
export const matchDataValidator =
  Prisma.validator<Prisma.MatchFindUniqueArgs>()({
    where: { id: "" },
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

// 2. AllMatches 쿼리 validator 정의
export const allMatchesValidator = Prisma.validator<Prisma.MatchFindManyArgs>()(
  {
    where: { scheduleId: "" },
    select: {
      id: true,
      homeScore: true,
      awayScore: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  }
);

// 3. Goals 쿼리 validator 정의
export const goalsValidator = Prisma.validator<Prisma.GoalRecordFindManyArgs>()(
  {
    where: { matchId: "" },
    include: {
      scorer: {
        select: { id: true, name: true, nickname: true },
      },
      assist: {
        select: { id: true, name: true, nickname: true },
      },
    },
    orderBy: { order: "asc" },
  }
);
