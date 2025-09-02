"use server";

import { prisma } from "@/shared/lib/prisma";
import type { Prisma } from "@prisma/client";

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
interface RatingAverages {
  shooting: number;
  passing: number;
  stamina: number;
  physical: number;
  dribbling: number;
  defense: number;
}

// 평가 데이터 처리 결과 타입
interface ProcessedRatings {
  averageRatings: RatingAverages;
  totalRatings: number;
  hasRatings: boolean;
}

// Prisma 생성 타입을 활용한 정확한 타입 정의
type PlayerWithTeams = Prisma.UserGetPayload<{
  include: typeof baseUserInclude;
}>;

type LineupWithMatch = Prisma.LineupGetPayload<{
  include: {
    match: {
      include: {
        schedule: true;
      };
    };
  };
}>;

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
      averageRatings: {
        shooting: 0,
        passing: 0,
        stamina: 0,
        physical: 0,
        dribbling: 0,
        defense: 0,
      },
      totalRatings: 0,
      hasRatings: false,
    };
  }

  const averageRatings: RatingAverages = {
    shooting: ratings.reduce((sum, r) => sum + r.shooting, 0) / ratings.length,
    passing: ratings.reduce((sum, r) => sum + r.passing, 0) / ratings.length,
    stamina: ratings.reduce((sum, r) => sum + r.stamina, 0) / ratings.length,
    physical: ratings.reduce((sum, r) => sum + r.physical, 0) / ratings.length,
    dribbling:
      ratings.reduce((sum, r) => sum + r.dribbling, 0) / ratings.length,
    defense: ratings.reduce((sum, r) => sum + r.defense, 0) / ratings.length,
  };

  return {
    averageRatings,
    totalRatings: ratings.length,
    hasRatings: true,
  };
}

// 유니크한 경기 수를 계산하는 헬퍼 함수
function getUniqueMatchesCount(lineups: LineupWithMatch[]): number {
  const uniqueMatches = new Set(
    lineups
      .filter((lineup) => lineup.match?.schedule)
      .map((lineup) => lineup.match.id)
  );
  return uniqueMatches.size;
}

export async function getPlayer(id: string) {
  try {
    // const currentYear = new Date().getFullYear();
    // 현재 날짜 정보
    // const currentDate = new Date();
    // const currentYear = currentDate.getFullYear();
    // const currentMonth = currentDate.getMonth() + 1;

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

    // 통계 데이터를 별도로 조회
    const [lineups, goals, assists, attendances, playerRatings] =
      await Promise.all([
        // 경기 참여 데이터
        prisma.lineup.findMany({
          where: {
            userId: id,
          },
          include: {
            match: {
              include: {
                schedule: true,
              },
            },
          },
        }),

        // 득점 데이터
        prisma.goalRecord.findMany({
          where: {
            scorerId: id,
            isOwnGoal: false,
          },
          include: {
            match: {
              include: {
                schedule: true,
              },
            },
          },
        }),

        // 어시스트 데이터
        prisma.goalRecord.findMany({
          where: {
            assistId: id,
          },
          include: {
            match: {
              include: {
                schedule: true,
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

    const filteredTeams = player.teams.filter(
      (team) => team.team.status === "ACTIVE"
    );

    // 통계 계산
    const stats = {
      matches: getUniqueMatchesCount(lineups),
      goals: goals.length,
      assists: assists.length,
      mvp: attendances.reduce(
        (total: number, attendance: AttendanceWithSchedule) =>
          total + attendance.mvpReceived,
        0
      ),
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
    matches: number;
    goals: number;
    assists: number;
    mvp: number;
  };
  ratings: ProcessedRatings;
};
