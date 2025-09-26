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

// 나이를 생년월일 범위로 변환하는 헬퍼 함수
function convertAgeToBirthDateRange(minAge?: number, maxAge?: number) {
  const currentYear = new Date().getFullYear();
  const birthDateConditions: {
    gte?: string;
    lte?: string;
  } = {};

  if (maxAge) {
    // maxAge보다 나이가 적거나 같은 사람 = 생년월일이 특정 년도 1월 1일 이후인 사람
    const birthYearForMaxAge = currentYear - maxAge;
    const minBirthDate = `${birthYearForMaxAge}0101`; // YYYYMMDD 형식
    birthDateConditions.gte = minBirthDate;
  }

  if (minAge) {
    // minAge보다 나이가 많거나 같은 사람 = 생년월일이 특정 년도 12월 31일 이전인 사람
    const birthYearForMinAge = currentYear - minAge;
    const maxBirthDate = `${birthYearForMinAge}1231`; // YYYYMMDD 형식
    birthDateConditions.lte = maxBirthDate;
  }

  return Object.keys(birthDateConditions).length > 0
    ? { birthDate: birthDateConditions }
    : {};
}

// 검색 조건 생성 함수
function createSearchCondition(searchQuery?: string) {
  if (!searchQuery?.trim()) {
    return {};
  }

  const trimmedQuery = searchQuery.trim();

  return {
    OR: [
      { nickname: { contains: trimmedQuery, mode: "insensitive" as const } },
    ],
  };
}

// 필터 조건 생성 함수 (DRY 원칙 적용)
function createFilterConditions(filters?: PlayerFilters) {
  return {
    ...createSearchCondition(filters?.searchQuery),
    ...(filters?.gender && { gender: filters.gender }),
    ...(filters?.background && { playerBackground: filters.background }),
    ...(filters?.skillLevel?.length && {
      skillLevel: { in: filters.skillLevel },
    }),
    ...convertAgeToBirthDateRange(filters?.minAge, filters?.maxAge),
  };
}

// 팀 정보 포함 옵션 생성 함수 (DRY 원칙 적용)
function createTeamIncludeOptions() {
  return {
    teams: {
      where: {
        status: "APPROVED" as const,
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
  };
}

export async function getPlayers(
  page: number = 1,
  filters?: PlayerFilters
): Promise<PlayersResponse> {
  try {
    const session = await auth();
    const skip = (page - 1) * PLAYERS_PER_PAGE;

    const filterConditions = createFilterConditions(filters);
    const whereCondition = session?.user?.id
      ? {
          NOT: { id: session.user.id },
          ...filterConditions,
        }
      : filterConditions;

    const playersPromise = prisma.user.findMany({
      where: whereCondition,
      include: createTeamIncludeOptions(),
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: PLAYERS_PER_PAGE,
    });

    // 총 개수도 필터 조건 적용
    const totalCountPromise = prisma.user.count({
      where: whereCondition,
    });

    const userPromise = session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id, ...filterConditions },
          include: createTeamIncludeOptions(),
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
    const filterConditions = createFilterConditions(filters);

    // 내가 팔로우하는 사용자들 가져오기
    const followingUsersPromise = prisma.user.findMany({
      where: {
        followers: {
          some: {
            followerId: session.user.id,
          },
        },
        ...filterConditions,
      },
      include: createTeamIncludeOptions(),
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: PLAYERS_PER_PAGE,
    });

    // 팔로잉하는 사용자 총 개수 (필터 조건 적용)
    const totalCountPromise = prisma.user.count({
      where: {
        followers: {
          some: {
            followerId: session.user.id,
          },
        },
        ...filterConditions,
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
