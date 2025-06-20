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
  }[];
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

    if (userId) {
      // 사용자의 소속 팀들 조회
      const myTeams = await prisma.team.findMany({
        where: {
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
        include: {
          members: {
            where: {
              userId: userId,
            },
            select: {
              status: true,
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

      return {
        success: true,
        data: {
          myTeams: myTeams as TeamWithDetails[],
          teams: teams as TeamWithDetails[],
        },
      };
    }

    // 비로그인 사용자의 경우
    return {
      success: true,
      data: {
        myTeams: [],
        teams: teams as TeamWithDetails[],
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
