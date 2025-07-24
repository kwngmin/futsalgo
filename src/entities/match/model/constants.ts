import { Prisma } from "@prisma/client";

// 1. Match 쿼리 validator 정의 (lineups 제거 - 별도 쿼리로 분리)
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

// 3. Lineups 쿼리 validator 정의 (기본 - name 필드 없음)
export const lineupsValidator = Prisma.validator<Prisma.LineupFindManyArgs>()({
  where: { matchId: "" },
  include: {
    user: {
      select: {
        id: true,
        nickname: true,
        image: true,
        position: true,
      },
    },
  },
});

// 4. Lineups 쿼리 validator 정의 (멤버용 - name 필드 포함)
export const lineupsWithNameValidator =
  Prisma.validator<Prisma.LineupFindManyArgs>()({
    where: { matchId: "" },
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
  });

// 5. Goals 쿼리 validator 정의 (기본 - name 필드 없음)
export const goalsValidator = Prisma.validator<Prisma.GoalRecordFindManyArgs>()(
  {
    where: { matchId: "" },
    include: {
      scorer: {
        select: { id: true, nickname: true },
      },
      assist: {
        select: { id: true, nickname: true },
      },
    },
    orderBy: { order: "asc" },
  }
);

// 6. Goals 쿼리 validator 정의 (멤버용 - name 필드 포함)
export const goalsWithNameValidator =
  Prisma.validator<Prisma.GoalRecordFindManyArgs>()({
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
  });
