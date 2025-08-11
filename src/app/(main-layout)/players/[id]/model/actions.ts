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
} satisfies Prisma.UserInclude;

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

export async function getPlayer(id: string) {
  try {
    const currentYear = new Date().getFullYear();

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
    const [lineups, goals, assists, attendances] = await Promise.all([
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

    return {
      success: true,
      data: {
        ...player,
        teams: filteredTeams,
        stats,
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

// 유니크한 경기 수를 계산하는 헬퍼 함수
function getUniqueMatchesCount(lineups: LineupWithMatch[]): number {
  const uniqueMatches = new Set(
    lineups
      .filter((lineup) => lineup.match?.schedule)
      .map((lineup) => lineup.match.id)
  );
  return uniqueMatches.size;
}

// 컴포넌트에서 사용할 수 있도록 타입 내보내기
export type PlayerData = PlayerWithTeams & {
  stats: {
    matches: number;
    goals: number;
    assists: number;
    mvp: number;
  };
};
