"use server";

import { TeamFilters } from "@/features/filter-list/model/types";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Prisma, TeamStatus, TeamMemberStatus } from "@prisma/client";

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
    myTeams?: TeamWithDetails[];
    teams: TeamWithDetails[];
    hasMore: boolean;
    totalCount: number;
    currentPage: number;
  };
  error?: string;
}

// 검색 조건 생성 함수
function createSearchCondition(searchQuery?: string) {
  if (!searchQuery || searchQuery.trim() === "") {
    return {};
  }

  const trimmedQuery = searchQuery.trim();

  return {
    OR: [{ name: { contains: trimmedQuery, mode: "insensitive" as const } }],
  };
}

// 프로 선수 통계 추가 함수
function addProfessionalStats<
  T extends { members: Array<{ user: { playerBackground: string } }> }
>(teams: T[]): (T & { stats: { professionalCount: number } })[] {
  return teams.map((team) => ({
    ...team,
    stats: {
      professionalCount: team.members.filter(
        (member) => member.user.playerBackground === "PROFESSIONAL"
      ).length,
    },
  }));
}

// 내가 속한 팀 조회 함수
async function getMyTeams(userId: string): Promise<TeamWithDetails[]> {
  const myTeams = await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId: userId,
          status: TeamMemberStatus.APPROVED,
        },
      },
    },
    include: {
      members: {
        where: {
          status: TeamMemberStatus.APPROVED,
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
              status: TeamMemberStatus.APPROVED,
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

  return addProfessionalStats(myTeams) as TeamWithDetails[];
}

// 기본 팀 조회 조건 생성 함수
function createBaseTeamCondition(filters?: TeamFilters) {
  return {
    NOT: {
      status: {
        in: [TeamStatus.DISBANDED, TeamStatus.INACTIVE],
      },
    },
    ...createSearchCondition(filters?.searchQuery),
    gender: filters?.gender,
    city: filters?.city,
    district: filters?.district,
    recruitmentStatus: filters?.recruitment,
    teamMatchAvailable: filters?.teamMatchAvailable,
    level: { in: filters?.teamLevel },
  };
}

export async function getTeams(
  page: number = 1,
  filters?: TeamFilters
): Promise<GetTeamsResponse> {
  console.log("filters", filters);
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const skip = (page - 1) * TEAMS_PER_PAGE;

    // 기본 조회 조건
    const baseCondition = createBaseTeamCondition(filters);

    // 로그인한 사용자의 경우 내가 속한 팀 제외
    const whereCondition = userId
      ? {
          ...baseCondition,
          NOT: [
            baseCondition.NOT,
            {
              members: {
                some: {
                  userId: userId,
                  status: TeamMemberStatus.APPROVED,
                },
              },
            },
          ].filter(Boolean),
        }
      : baseCondition;

    // 모든 팀 조회 (내가 속한 팀 제외, 페이지네이션 적용)
    const teamsPromise = prisma.team.findMany({
      where: whereCondition,
      include: {
        members: {
          where: {
            status: TeamMemberStatus.APPROVED,
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
                status: TeamMemberStatus.APPROVED,
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

    // 총 팀 개수 (내가 속한 팀 제외)
    const totalCountPromise = prisma.team.count({
      where: whereCondition,
    });

    const [teams, totalCount] = await Promise.all([
      teamsPromise,
      totalCountPromise,
    ]);

    // 각 팀에 프로 선수 통계 추가
    const teamsWithStats = addProfessionalStats(teams) as TeamWithDetails[];
    const hasMore = skip + teams.length < totalCount;

    if (userId) {
      // 첫 페이지에서만 사용자의 소속 팀들 조회
      const myTeamsWithStats = page === 1 ? await getMyTeams(userId) : [];

      return {
        success: true,
        data: {
          myTeams: myTeamsWithStats,
          teams: teamsWithStats,
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
        teams: teamsWithStats,
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
  page: number = 1,
  filters?: TeamFilters
): Promise<GetFollowingTeamsResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    const skip = (page - 1) * TEAMS_PER_PAGE;
    const baseCondition = createBaseTeamCondition(filters);

    // 내가 팔로우하는 팀들 가져오기
    const followingTeamsPromise = prisma.team.findMany({
      where: {
        followers: {
          some: {
            userId: session.user.id,
          },
        },
        ...baseCondition,
      },
      include: {
        members: {
          where: {
            status: TeamMemberStatus.APPROVED,
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
                status: TeamMemberStatus.APPROVED,
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
        ...baseCondition,
      },
    });

    const [followingTeams, totalCount] = await Promise.all([
      followingTeamsPromise,
      totalCountPromise,
    ]);

    // 각 팀에 프로 선수 통계 추가
    const teamsWithStats = addProfessionalStats(
      followingTeams
    ) as TeamWithDetails[];
    const hasMore = skip + followingTeams.length < totalCount;

    // 첫 페이지에서만 사용자의 소속 팀들 조회
    const myTeamsWithStats =
      page === 1 ? await getMyTeams(session.user.id) : [];

    return {
      success: true,
      data: {
        myTeams: myTeamsWithStats,
        teams: teamsWithStats,
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
