"use server";

import { PlayerFilters } from "@/features/filter-list/model/types";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@prisma/client";

const PLAYERS_PER_PAGE = 20;

// 팀 정보 타입
type TeamInfo = {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  city: string;
  district: string;
  status: string;
  recruitmentStatus: string;
  gender: string;
  level: string;
};

// 팀 멤버십 타입
export type TeamMembership = {
  team: TeamInfo;
  status: string;
  role: string;
  joinedAt: Date | null;
};

// 사용자 타입 (팀 정보 포함)
type UserWithTeams = Prisma.UserGetPayload<{
  include: {
    teams: {
      select: {
        team: {
          select: {
            id: true;
            name: true;
            logoUrl: true;
            description: true;
            city: true;
            district: true;
            status: true;
            recruitmentStatus: true;
            gender: true;
            level: true;
          };
        };
        status: true;
        role: true;
        joinedAt: true;
      };
    };
  };
}>;

// 타입 정의 수정
export type PlayersResponse =
  | {
      success: true;
      data: {
        user: UserWithTeams | null;
        players: UserWithTeams[];
        hasMore: boolean;
        totalCount: number;
        currentPage: number;
      };
    }
  | {
      success: false;
      error: string;
    };

export type FollowingPlayersResponse =
  | {
      success: true;
      data: {
        players: UserWithTeams[];
        hasMore: boolean;
        totalCount: number;
        currentPage: number;
      };
    }
  | {
      success: false;
      error: string;
    };

// 검색 조건 생성 함수
function createSearchCondition(searchQuery?: string) {
  if (!searchQuery || searchQuery.trim() === "") {
    return {};
  }

  const trimmedQuery = searchQuery.trim();

  return {
    OR: [
      { nickname: { contains: trimmedQuery, mode: "insensitive" as const } },
    ],
  };
}

export async function getPlayers(
  page: number = 1,
  filters?: PlayerFilters
): Promise<PlayersResponse> {
  try {
    const session = await auth();
    const skip = (page - 1) * PLAYERS_PER_PAGE;

    const playersPromise = prisma.user.findMany({
      where: session?.user?.id
        ? {
            NOT: {
              id: session.user.id,
            },
            ...createSearchCondition(filters?.searchQuery),
            gender: filters?.gender,
            playerBackground: filters?.background,
            // lowerAge: filters?.lowerAge,
            // higherAge: filters?.higherAge,
            skillLevel: { in: filters?.skillLevel },
          }
        : {
            ...createSearchCondition(filters?.searchQuery),
            gender: filters?.gender,
            playerBackground: filters?.background,
            // lowerAge: filters?.lowerAge,
            // higherAge: filters?.higherAge,
            skillLevel: { in: filters?.skillLevel },
          },
      include: {
        teams: {
          where: {
            status: "APPROVED", // 승인된 팀 멤버십만 포함
          },
          select: {
            team: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                description: true,
                city: true,
                district: true,
                status: true,
                recruitmentStatus: true,
                gender: true,
                level: true,
              },
            },
            status: true,
            role: true,
            joinedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: PLAYERS_PER_PAGE,
    });

    // 총 개수도 함께 가져오기
    const totalCountPromise = prisma.user.count({
      where: session?.user?.id
        ? {
            NOT: {
              id: session.user.id,
            },
          }
        : {},
    });

    const userPromise = session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          include: {
            teams: {
              where: {
                status: "APPROVED", // 현재 사용자의 승인된 팀 멤버십도 포함
              },
              select: {
                team: {
                  select: {
                    id: true,
                    name: true,
                    logoUrl: true,
                    description: true,
                    city: true,
                    district: true,
                    status: true,
                    recruitmentStatus: true,
                    gender: true,
                    level: true,
                  },
                },
                status: true,
                role: true,
                joinedAt: true,
              },
            },
          },
        })
      : Promise.resolve(null);

    const [players, totalCount, user] = await Promise.all([
      playersPromise,
      totalCountPromise,
      userPromise,
    ]);

    const hasMore = skip + players.length < totalCount;

    return {
      success: true,
      data: {
        user,
        players,
        hasMore,
        totalCount,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("회원 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}

export async function getFollowingPlayers(
  page: number = 1,
  filters?: PlayerFilters
): Promise<FollowingPlayersResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    const skip = (page - 1) * PLAYERS_PER_PAGE;

    // 내가 팔로우하는 사용자들 가져오기
    const followingUsersPromise = prisma.user.findMany({
      where: {
        followers: {
          some: {
            followerId: session.user.id,
          },
        },
        ...createSearchCondition(filters?.searchQuery),
        gender: filters?.gender,
        playerBackground: filters?.background,
        // lowerAge: filters?.lowerAge,
        // higherAge: filters?.higherAge,
        skillLevel: { in: filters?.skillLevel },
      },
      include: {
        teams: {
          where: {
            status: "APPROVED",
          },
          select: {
            team: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                description: true,
                city: true,
                district: true,
                status: true,
                recruitmentStatus: true,
                gender: true,
                level: true,
              },
            },
            status: true,
            role: true,
            joinedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: PLAYERS_PER_PAGE,
    });

    // 팔로잉하는 사용자 총 개수
    const totalCountPromise = prisma.user.count({
      where: {
        followers: {
          some: {
            followerId: session.user.id,
          },
        },
      },
    });

    const [followingUsers, totalCount] = await Promise.all([
      followingUsersPromise,
      totalCountPromise,
    ]);

    const hasMore = skip + followingUsers.length < totalCount;

    return {
      success: true,
      data: {
        players: followingUsers,
        hasMore,
        totalCount,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("팔로잉 회원 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
