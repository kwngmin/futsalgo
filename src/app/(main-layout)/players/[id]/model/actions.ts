"use server";

import { prisma } from "@/shared/lib/prisma";
import { MatchType, type Prisma } from "@prisma/client";

// 기본 사용자 정보와 팀 정보
const baseUserInclude = {
  teams: {
    where: {
      status: "APPROVED" as const,
    },
    include: {
      team: {
        include: {
          members: {
            where: {
              status: "APPROVED" as const,
            },
            include: {
              user: {
                select: {
                  playerBackground: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: {
                where: {
                  status: "APPROVED" as const,
                },
              },
              followers: true,
            },
          },
        },
      },
    },
  },
  followers: true,
  accounts: { select: { provider: true } },
} satisfies Prisma.UserInclude;

// 팀원 평가 데이터 타입 정의
type TeamMemberRatingWithRelations = Prisma.TeamMemberRatingGetPayload<{
  include: {
    fromUser: {
      select: {
        id: true;
        name: true;
        nickname: true;
        image: true;
      };
    };
    team: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

// 평가 평균 데이터 타입
interface TotalRatings {
  shooting: number;
  passing: number;
  stamina: number;
  physical: number;
  dribbling: number;
  defense: number;
}

// 평가 데이터 처리 결과 타입
interface ProcessedRatings {
  totalRatings: TotalRatings;
  raterCount: number;
  hasRatings: boolean;
}

// Prisma 생성 타입을 활용한 정확한 타입 정의
type PlayerWithTeams = Prisma.UserGetPayload<{
  include: typeof baseUserInclude;
}>;

// LineupWithMatch 타입은 더 이상 사용하지 않음 (성능 최적화로 제거)

// type GoalWithMatch = Prisma.GoalRecordGetPayload<{
//   include: {
//     match: {
//       include: {
//         schedule: true;
//       };
//     };
//   };
// }>;

type AttendanceWithSchedule = Prisma.ScheduleAttendanceGetPayload<{
  include: {
    schedule: true;
  };
}>;

// 평가 데이터 처리 함수
function processPlayerRatings(
  ratings: TeamMemberRatingWithRelations[]
): ProcessedRatings {
  if (ratings.length === 0) {
    return {
      totalRatings: {
        shooting: 0,
        passing: 0,
        stamina: 0,
        physical: 0,
        dribbling: 0,
        defense: 0,
      },
      raterCount: 0,
      hasRatings: false,
    };
  }

  const ratingKeys: (keyof TotalRatings)[] = [
    "shooting",
    "passing",
    "stamina",
    "physical",
    "dribbling",
    "defense",
  ];

  // 한 번의 순회로 모든 합계 계산
  const totalRatings: TotalRatings = ratings.reduce(
    (acc, rating) => {
      ratingKeys.forEach((key) => {
        acc[key] += rating[key];
      });
      return acc;
    },
    {
      shooting: 0,
      passing: 0,
      stamina: 0,
      physical: 0,
      dribbling: 0,
      defense: 0,
    } as TotalRatings
  );

  return {
    totalRatings,
    raterCount: ratings.length,
    hasRatings: true,
  };
}

// 유니크한 경기 수를 계산하는 헬퍼 함수 (최적화된 버전)
function getUniqueMatchesCount(
  lineups: Array<{ match: { id: string } }>
): number {
  const uniqueMatches = new Set(
    lineups
      .filter((lineup) => lineup.match?.id)
      .map((lineup) => lineup.match.id)
  );
  return uniqueMatches.size;
}

export async function getPlayer(id: string) {
  try {
    // 기본 사용자 정보 조회
    const player = await prisma.user.findUnique({
      where: { id },
      include: baseUserInclude,
    });

    if (!player) {
      return {
        success: false,
        error: "회원을 찾을 수 없습니다",
      } as const;
    }

    // 친선전 통계 데이터를 별도로 조회
    const [teamLineups, teamGoals, teamAssists, teamAttendances] =
      await Promise.all([
        // 경기 참여 데이터
        prisma.lineup.findMany({
          where: {
            userId: id,
            match: {
              isLinedUp: true,
              schedule: {
                matchType: MatchType.TEAM,
              },
            },
          },
          select: {
            id: true,
            matchId: true,
            match: {
              select: {
                id: true,
                schedule: {
                  select: {
                    id: true,
                    place: true,
                    date: true,
                  },
                },
              },
            },
          },
        }),

        // 득점 데이터
        prisma.goalRecord.findMany({
          where: {
            scorerId: id,
            isOwnGoal: false,
            match: {
              isLinedUp: true,
              schedule: {
                matchType: MatchType.TEAM,
              },
            },
          },
          select: {
            id: true,
            matchId: true,
            match: {
              select: {
                id: true,
                schedule: {
                  select: {
                    id: true,
                    place: true,
                    date: true,
                  },
                },
              },
            },
          },
        }),

        // 어시스트 데이터
        prisma.goalRecord.findMany({
          where: {
            assistId: id,
            match: {
              isLinedUp: true,
              schedule: {
                matchType: MatchType.TEAM,
              },
            },
          },
          select: {
            id: true,
            matchId: true,
            match: {
              select: {
                id: true,
                schedule: {
                  select: {
                    id: true,
                    place: true,
                    date: true,
                  },
                },
              },
            },
          },
        }),

        // MVP 데이터 (최적화된 쿼리)
        prisma.scheduleAttendance.findMany({
          where: {
            userId: id,
            mvpReceived: {
              gt: 0,
            },
            schedule: {
              matchType: MatchType.TEAM,
            },
          },
          select: {
            id: true,
            mvpReceived: true,
            schedule: {
              select: {
                id: true,
                place: true,
                date: true,
              },
            },
          },
        }),
      ]);

    // 자체전 통계 데이터를 별도로 조회
    const [squadLineups, squadGoals, squadAssists, squadAttendances] =
      await Promise.all([
        // 경기 참여 데이터
        prisma.lineup.findMany({
          where: {
            userId: id,
            match: {
              isLinedUp: true,
              schedule: {
                matchType: MatchType.SQUAD,
              },
            },
          },
          select: {
            id: true,
            matchId: true,
            match: {
              select: {
                id: true,
                schedule: {
                  select: {
                    id: true,
                    place: true,
                    date: true,
                  },
                },
              },
            },
          },
        }),

        // 득점 데이터
        prisma.goalRecord.findMany({
          where: {
            scorerId: id,
            isOwnGoal: false,
            match: {
              isLinedUp: true,
              schedule: {
                matchType: MatchType.SQUAD,
              },
            },
          },
          select: {
            id: true,
            matchId: true,
            match: {
              select: {
                id: true,
                schedule: {
                  select: {
                    id: true,
                    place: true,
                    date: true,
                  },
                },
              },
            },
          },
        }),

        // 어시스트 데이터
        prisma.goalRecord.findMany({
          where: {
            assistId: id,
            match: {
              isLinedUp: true,
              schedule: {
                matchType: MatchType.SQUAD,
              },
            },
          },
          select: {
            id: true,
            matchId: true,
            match: {
              select: {
                id: true,
                schedule: {
                  select: {
                    id: true,
                    place: true,
                    date: true,
                  },
                },
              },
            },
          },
        }),

        // MVP 데이터
        prisma.scheduleAttendance.findMany({
          where: {
            userId: id,
            mvpReceived: {
              gt: 0,
            },
            schedule: {
              matchType: MatchType.SQUAD,
            },
          },
          include: {
            schedule: true,
          },
        }),

        // 팀원 평가 데이터
        prisma.teamMemberRating.findMany({
          where: {
            toUserId: id,
            // periodYear: currentYear,
            // periodMonth: currentMonth,
          },
          include: {
            fromUser: {
              select: {
                id: true,
                name: true,
                nickname: true,
                image: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      ]);

    // 팀원 평가 데이터
    const playerRatings = await prisma.teamMemberRating.findMany({
      where: {
        toUserId: id,
        // periodYear: currentYear,
        // periodMonth: currentMonth,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const filteredTeams = player.teams.filter(
      (team) => team.team.status === "ACTIVE"
    );

    // 통계 계산
    const stats = {
      team: {
        matches: getUniqueMatchesCount(teamLineups),
        goals: teamGoals.length,
        assists: teamAssists.length,
        mvp: teamAttendances.reduce(
          (total: number, attendance: { mvpReceived: number }) =>
            total + attendance.mvpReceived,
          0
        ),
      },
      squad: {
        matches: getUniqueMatchesCount(squadLineups),
        goals: squadGoals.length,
        assists: squadAssists.length,
        mvp: squadAttendances.reduce(
          (total: number, attendance: AttendanceWithSchedule) =>
            total + attendance.mvpReceived,
          0
        ),
      },
    };

    // 평가 데이터 처리
    const ratings = processPlayerRatings(playerRatings);

    return {
      success: true,
      data: {
        ...player,
        teams: filteredTeams,
        stats,
        ratings, // 🎯 새로 추가
      },
    } as const;
  } catch (error) {
    console.error("회원 데이터 조회 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    } as const;
  }
}

// 컴포넌트에서 사용할 수 있도록 타입 내보내기
export type PlayerData = PlayerWithTeams & {
  stats: {
    team: {
      matches: number;
      goals: number;
      assists: number;
      mvp: number;
    };
    squad: {
      matches: number;
      goals: number;
      assists: number;
      mvp: number;
    };
  };
  ratings: ProcessedRatings;
};
