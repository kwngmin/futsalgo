"use server";

import { cache } from "react";
import { ScheduleFilters } from "@/features/filter-list/model/types";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import {
  Team,
  Schedule,
  ScheduleAttendance,
  User,
  ScheduleLike,
} from "@prisma/client";

export interface ScheduleWithDetails extends Schedule {
  hostTeam: Team;
  invitedTeam: Team | null;
  attendances: ScheduleAttendance[];
  createdBy: User;
  likes: ScheduleLike[];
}

export interface GetMySchedulesResponse {
  success: boolean;
  error?: string;
  data?: {
    schedules: ScheduleWithDetails[];
    hasTeams: boolean;
    manageableTeams: Team[];
    hasMore?: boolean;
    totalCount?: number;
  };
}

export interface ScheduleFiltersWithPagination extends ScheduleFilters {
  page?: number;
  pageSize?: number;
}

const SCHEDULE_INCLUDE = {
  hostTeam: true,
  invitedTeam: true,
  attendances: true,
  createdBy: true,
  likes: true,
} as const;

function createScheduleWhereCondition(teamIds: string[]) {
  return {
    status: { not: "DELETED" as const },
    OR: [{ hostTeamId: { in: teamIds } }, { invitedTeamId: { in: teamIds } }],
  };
}

async function getUserTeamInfo(userId: string) {
  const player = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      teams: {
        where: { status: "APPROVED" },
        include: { team: true },
      },
    },
  });

  if (!player) {
    throw new Error("사용자를 찾을 수 없습니다");
  }

  const approvedTeamIds = player.teams.map((t) => t.teamId);
  const manageableTeams = player.teams
    .filter((t) => ["OWNER", "MANAGER"].includes(t.role))
    .map((t) => t.team);

  return {
    approvedTeamIds,
    manageableTeams,
  };
}

function createSearchCondition(searchQuery?: string) {
  if (!searchQuery || searchQuery.trim() === "") {
    return {};
  }

  const trimmedQuery = searchQuery.trim();

  return {
    OR: [
      {
        hostTeam: {
          name: { contains: trimmedQuery, mode: "insensitive" as const },
        },
      },
      {
        invitedTeam: {
          name: { contains: trimmedQuery, mode: "insensitive" as const },
        },
      },
      { place: { contains: trimmedQuery, mode: "insensitive" as const } },
    ],
  };
}

async function getAllSchedules(
  teamIds: string[],
  filters: ScheduleFiltersWithPagination
): Promise<{ schedules: ScheduleWithDetails[]; totalCount: number }> {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const whereCondition = {
    ...createScheduleWhereCondition(teamIds),
    ...createSearchCondition(filters.searchQuery),
    matchType: filters.matchType,
    dayOfWeek: filters.days ? { in: filters.days } : undefined,
    startPeriod: filters.startPeriod ? { in: filters.startPeriod } : undefined,
    city: filters.city,
    district: filters.district,
  };

  const [schedules, totalCount] = await Promise.all([
    prisma.schedule.findMany({
      where: whereCondition,
      include: SCHEDULE_INCLUDE,
      orderBy: [{ date: "desc" }, { startTime: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }) as Promise<ScheduleWithDetails[]>,
    prisma.schedule.count({ where: whereCondition }),
  ]);

  return { schedules, totalCount };
}

function handleDatabaseError(error: unknown): string {
  if (
    error instanceof Error &&
    error.message.includes("Can't reach database server")
  ) {
    return "데이터베이스 서버에 연결할 수 없습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.";
  }
  return "서버 오류가 발생했습니다";
}

/**
 * 내 일정 조회 - 페이지네이션 지원
 * React의 cache()로 요청 중복 제거
 */
export const getMySchedules = cache(
  async (
    filters: ScheduleFiltersWithPagination = {}
  ): Promise<GetMySchedulesResponse> => {
    const startTime = performance.now();
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    console.log(`🔍 Fetching my schedules - Page ${page}:`, filters);

    try {
      await prisma.$queryRaw`SELECT 1`;

      const session = await auth();

      if (!session?.user?.id) {
        return {
          success: false,
          error: "로그인이 필요합니다",
        };
      }

      const { approvedTeamIds, manageableTeams } = await getUserTeamInfo(
        session.user.id
      );

      if (approvedTeamIds.length === 0) {
        return {
          success: true,
          data: {
            schedules: [],
            hasTeams: false,
            manageableTeams: [],
            hasMore: false,
            totalCount: 0,
          },
        };
      }

      const { schedules, totalCount } = await getAllSchedules(
        approvedTeamIds,
        filters
      );

      const endTime = performance.now();
      console.log(`✅ My schedules fetched in ${endTime - startTime}ms`);

      return {
        success: true,
        data: {
          schedules,
          hasTeams: approvedTeamIds.length > 0,
          manageableTeams: page === 1 ? manageableTeams : [],
          hasMore: schedules.length === pageSize,
          totalCount,
        },
      };
    } catch (error) {
      console.error("내 일정 목록 조회 실패:", error);

      return {
        success: false,
        error: handleDatabaseError(error),
      };
    }
  }
);
