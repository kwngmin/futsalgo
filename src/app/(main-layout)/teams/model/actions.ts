"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@prisma/client";

const TEAMS_PER_PAGE = 20;

// 팀 타입 정의
type TeamWithDetails = Prisma.TeamGetPayload<{
  include: {
    members: {
      where: {
        status: "APPROVED";
      };
      include: {
        user: {
          select: {
            playerBackground: true;
          };
        };
      };
    };
    _count: {
      select: {
        members: {
          where: {
            status: "APPROVED";
          };
        };
        followers: true;
      };
    };
  };
}> & {
  stats: {
    professionalCount: number;
  };
};

export interface GetTeamsResponse {
  success: boolean;
  data?: {
    myTeams?: TeamWithDetails[];
    teams: TeamWithDetails[];
    hasMore: boolean;
    totalCount: number;
    currentPage: number;
  };
  error?: string;
}

export interface GetFollowingTeamsResponse {
  success: boolean;
  data?: {
    teams: TeamWithDetails[];
    hasMore: boolean;
    totalCount: number;
    currentPage: number;
  };
  error?: string;
}

export async function getTeams(page: number = 1): Promise<GetTeamsResponse> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const skip = (page - 1) * TEAMS_PER_PAGE;

    // 모든 팀 조회 (페이지네이션 적용)
    const teamsPromise = prisma.team.findMany({
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
      skip,
      take: TEAMS_PER_PAGE,
    });

    // 총 팀 개수
    const totalCountPromise = prisma.team.count();

    const [teams, totalCount] = await Promise.all([
      teamsPromise,
      totalCountPromise,
    ]);

    // 각 팀에 프로 선수 통계 추가
    const teamsWithStats = teams.map((team) => ({
      ...team,
      stats: {
        professionalCount: team.members.filter(
          (member) => member.user.playerBackground === "PROFESSIONAL"
        ).length,
      },
    }));

    const hasMore = skip + teams.length < totalCount;

    if (userId) {
      // 첫 페이지에서만 사용자의 소속 팀들 조회
      let myTeamsWithStats: TeamWithDetails[] = [];

      if (page === 1) {
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
        myTeamsWithStats = myTeams.map((team) => ({
          ...team,
          stats: {
            professionalCount: team.members.filter(
              (member) => member.user.playerBackground === "PROFESSIONAL"
            ).length,
          },
        })) as TeamWithDetails[];
      }

      return {
        success: true,
        data: {
          myTeams: myTeamsWithStats,
          teams: teamsWithStats as TeamWithDetails[],
          hasMore,
          totalCount,
          currentPage: page,
        },
      };
    }

    // 비로그인 사용자의 경우
    return {
      success: true,
      data: {
        teams: teamsWithStats as TeamWithDetails[],
        hasMore,
        totalCount,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("팀 데이터 조회 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}

export async function getFollowingTeams(
  page: number = 1
): Promise<GetFollowingTeamsResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    const skip = (page - 1) * TEAMS_PER_PAGE;

    // 내가 팔로우하는 팀들 가져오기
    const followingTeamsPromise = prisma.team.findMany({
      where: {
        followers: {
          some: {
            userId: session.user.id,
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
      skip,
      take: TEAMS_PER_PAGE,
    });

    // 팔로잉하는 팀 총 개수
    const totalCountPromise = prisma.team.count({
      where: {
        followers: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    const [followingTeams, totalCount] = await Promise.all([
      followingTeamsPromise,
      totalCountPromise,
    ]);

    // 각 팀에 프로 선수 통계 추가
    const teamsWithStats = followingTeams.map((team) => ({
      ...team,
      stats: {
        professionalCount: team.members.filter(
          (member) => member.user.playerBackground === "PROFESSIONAL"
        ).length,
      },
    }));

    const hasMore = skip + followingTeams.length < totalCount;

    return {
      success: true,
      data: {
        teams: teamsWithStats as TeamWithDetails[],
        hasMore,
        totalCount,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("팔로잉 팀 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
