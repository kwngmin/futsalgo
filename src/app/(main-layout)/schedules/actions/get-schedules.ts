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
  ScheduleStatus,
} from "@prisma/client";

export interface ScheduleWithDetails extends Schedule {
  hostTeam: Team;
  invitedTeam: Team | null;
  attendances: ScheduleAttendance[];
  createdBy: User;
  likes: ScheduleLike[];
}

export interface GetSchedulesResponse {
  success: boolean;
  error?: string;
  data?: {
    todaysSchedules: ScheduleWithDetails[];
    upcomingSchedules: ScheduleWithDetails[];
    pastSchedules: ScheduleWithDetails[];
    hasTeams: boolean;
    manageableTeams: Team[];
    likes: ScheduleLike[];
    hasMore?: boolean; // 더 가져올 데이터가 있는지
    totalCount?: number; // 전체 개수
  };
}

// 페이지네이션을 위한 인터페이스 확장
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

const DateUtils = {
  // 한국 시간 기준으로 Date 객체 가져오기
  getKoreanDate(): Date {
    const now = new Date();
    // UTC 시간에 9시간 더하기 (KST = UTC+9)
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const koreanTime = new Date(utcTime + 9 * 60 * 60 * 1000);
    return koreanTime;
  },

  // 날짜를 YYYY-MM-DD 형식으로 포맷팅하는 공통 함수
  formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  getTodayString(): string {
    const today = this.getKoreanDate();
    return this.formatDateString(today);
  },

  getTomorrowString(): string {
    const today = this.getKoreanDate();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.formatDateString(tomorrow);
  },
};

function createScheduleWhereCondition(teamIds: string[]) {
  return {
    NOT: {
      status: {
        in: [ScheduleStatus.REJECTED, ScheduleStatus.DELETED],
      },
    },
    OR: [{ hostTeamId: { in: teamIds } }, { invitedTeamId: { in: teamIds } }],
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

/**
 * 과거 일정 조회 - 페이지네이션 지원
 */
async function getPastSchedules(
  filters: ScheduleFiltersWithPagination
): Promise<{ schedules: ScheduleWithDetails[]; totalCount: number }> {
  const todayString = DateUtils.getTodayString();
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const whereCondition = {
    date: { lt: todayString },
    NOT: {
      status: {
        in: [
          ScheduleStatus.PENDING,
          ScheduleStatus.REJECTED,
          ScheduleStatus.READY,
          ScheduleStatus.DELETED,
          ScheduleStatus.CONFIRMED,
        ],
      },
    },
    ...createSearchCondition(filters.searchQuery),
    matchType: filters.matchType,
    dayOfWeek: filters.days ? { in: filters.days } : undefined,
    startPeriod: filters.startPeriod ? { in: filters.startPeriod } : undefined,
    city: filters.city,
    district: filters.district,
  };

  // 병렬로 데이터와 총 개수 조회
  const [schedules, totalCount] = await Promise.all([
    prisma.schedule.findMany({
      where: whereCondition,
      include: SCHEDULE_INCLUDE,
      orderBy: { date: "desc" },
      skip,
      take: pageSize,
    }) as Promise<ScheduleWithDetails[]>,
    prisma.schedule.count({ where: whereCondition }),
  ]);

  return { schedules, totalCount };
}

/**
 * 오늘 일정 조회 - 첫 페이지에만 필요
 */
async function getTodaysSchedules(
  teamIds: string[],
  filters?: ScheduleFilters
): Promise<ScheduleWithDetails[]> {
  const todayString = DateUtils.getTodayString();

  return prisma.schedule.findMany({
    where: {
      date: todayString,
      ...createScheduleWhereCondition(teamIds),
      ...createSearchCondition(filters?.searchQuery),
      matchType: filters?.matchType,
      dayOfWeek: filters?.days ? { in: filters.days } : undefined,
      startPeriod: filters?.startPeriod
        ? { in: filters.startPeriod }
        : undefined,
      city: filters?.city,
      district: filters?.district,
    },
    include: SCHEDULE_INCLUDE,
    orderBy: { createdAt: "desc" },
  }) as Promise<ScheduleWithDetails[]>;
}

/**
 * 예정된 일정 조회 - 첫 페이지에만 필요
 */
async function getUpcomingSchedules(
  teamIds: string[],
  filters?: ScheduleFilters
): Promise<ScheduleWithDetails[]> {
  const tomorrowString = DateUtils.getTomorrowString();

  return prisma.schedule.findMany({
    where: {
      date: { gte: tomorrowString },
      ...createScheduleWhereCondition(teamIds),
      ...createSearchCondition(filters?.searchQuery),
      matchType: filters?.matchType,
      dayOfWeek: filters?.days ? { in: filters.days } : undefined,
      startPeriod: filters?.startPeriod
        ? { in: filters.startPeriod }
        : undefined,
      city: filters?.city,
      district: filters?.district,
    },
    include: SCHEDULE_INCLUDE,
    orderBy: { date: "asc" },
  }) as Promise<ScheduleWithDetails[]>;
}

/**
 * 사용자의 팀 정보 조회
 */
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

/**
 * 일정 조회 - 페이지네이션 지원
 * React의 cache()로 요청 중복 제거
 */
export const getSchedules = cache(
  async (
    filters: ScheduleFiltersWithPagination = {}
  ): Promise<GetSchedulesResponse> => {
    const startTime = performance.now();
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    console.log(`🔍 Fetching schedules - Page ${page}:`, filters);

    try {
      await prisma.$queryRaw`SELECT 1`;

      const session = await auth();

      // 페이지 1인 경우에만 오늘/예정 일정 조회
      const shouldFetchTodayAndUpcoming = page === 1;

      // 로그인하지 않은 경우
      if (!session?.user?.id) {
        const { schedules: pastSchedules, totalCount } = await getPastSchedules(
          filters
        );

        const endTime = performance.now();
        console.log(`✅ Schedules fetched in ${endTime - startTime}ms`);

        return {
          success: true,
          data: {
            todaysSchedules: [],
            upcomingSchedules: [],
            pastSchedules,
            hasTeams: false,
            manageableTeams: [],
            likes: [],
            hasMore: pastSchedules.length === pageSize,
            totalCount,
          },
        };
      }

      // 로그인한 경우 - 1단계: pastSchedules와 팀 정보 병렬 조회
      const [{ schedules: pastSchedules, totalCount }, teamInfo] =
        await Promise.all([
          getPastSchedules(filters),
          getUserTeamInfo(session.user.id),
        ]);

      // 2단계: 팀 ID를 바탕으로 오늘/예정 일정 조회
      const [todaysSchedulesWithTeams, upcomingSchedulesWithTeams] =
        shouldFetchTodayAndUpcoming
          ? await Promise.all([
              getTodaysSchedules(teamInfo.approvedTeamIds, filters),
              getUpcomingSchedules(teamInfo.approvedTeamIds, filters),
            ])
          : [[], []];

      const endTime = performance.now();
      console.log(`✅ Schedules fetched in ${endTime - startTime}ms`);

      return {
        success: true,
        data: {
          pastSchedules,
          todaysSchedules: todaysSchedulesWithTeams,
          upcomingSchedules: upcomingSchedulesWithTeams,
          hasTeams: teamInfo.approvedTeamIds.length > 0,
          manageableTeams: shouldFetchTodayAndUpcoming
            ? teamInfo.manageableTeams
            : [],
          likes: [],
          hasMore: pastSchedules.length === pageSize,
          totalCount,
        },
      };
    } catch (error) {
      console.error("일정 목록 조회 실패:", error);

      if (
        error instanceof Error &&
        error.message.includes("Can't reach database server")
      ) {
        return {
          success: false,
          error:
            "데이터베이스 서버에 연결할 수 없습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.",
        };
      }

      return {
        success: false,
        error: "서버 오류가 발생했습니다",
      };
    }
  }
);

/**
 * 캐시 무효화 함수 (일정 생성/수정/삭제 시 호출)
 */
export async function revalidateSchedules() {
  "use server";
  const { revalidateTag } = await import("next/cache");
  revalidateTag("schedules", { expire: 0 });
}
