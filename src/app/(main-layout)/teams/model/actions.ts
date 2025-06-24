"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Team, User } from "@prisma/client";

interface TeamWithDetails extends Team {
  _count: {
    members: number;
    followers: number;
  };
  members?: {
    status: string;
    user: {
      playerBackground: string | null;
    };
  }[];
  stats?: {
    professionalCount: number;
  };
}

export interface GetTeamsResponse {
  success: boolean;
  error?: string;
  data: {
    user?: User | null;
    myTeams: TeamWithDetails[];
    teams: TeamWithDetails[];
  } | null;
}

export async function getTeams(): Promise<GetTeamsResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // 모든 팀 조회 (소속 팀 제외)
    const teams = await prisma.team.findMany({
      where: userId
        ? {
            NOT: {
              OR: [
                {
                  members: {
                    some: {
                      userId: userId,
                      status: "APPROVED",
                    },
                  },
                },
              ],
            },
          }
        : {},
      include: {
        members: {
          where: {
            status: "APPROVED",
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
                status: "APPROVED",
              },
            },
            followers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 각 팀에 프로 선수 통계 추가
    const teamsWithStats = teams.map((team) => ({
      ...team,
      stats: {
        professionalCount: team.members.filter(
          (member) => member.user.playerBackground === "PROFESSIONAL"
        ).length,
      },
    }));

    if (userId) {
      // 사용자의 소속 팀들 조회
      const myTeams = await prisma.team.findMany({
        where: {
          members: {
            some: {
              userId: userId,
              status: "APPROVED",
            },
          },
        },
        include: {
          members: {
            where: {
              status: "APPROVED",
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
                  status: "APPROVED",
                },
              },
              followers: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // 내 팀들에도 프로 선수 통계 추가
      const myTeamsWithStats = myTeams.map((team) => ({
        ...team,
        stats: {
          professionalCount: team.members.filter(
            (member) => member.user.playerBackground === "PROFESSIONAL"
          ).length,
        },
      }));

      return {
        success: true,
        data: {
          myTeams: myTeamsWithStats as TeamWithDetails[],
          teams: teamsWithStats as TeamWithDetails[],
        },
      };
    }

    // 비로그인 사용자의 경우
    return {
      success: true,
      data: {
        myTeams: [],
        teams: teamsWithStats as TeamWithDetails[],
      },
    };
  } catch (error) {
    console.error("팀 데이터 조회 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
      data: null,
    };
  }
}
