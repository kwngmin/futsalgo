"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import {
  Team,
  Schedule,
  ScheduleAttendance,
  User,
  ScheduleLike,
  ScheduleStatus,
  MatchType,
} from "@prisma/client";

// 필터 타입 정의
export interface ScheduleFilters {
  searchQuery?: string;
  matchType?: MatchType;
  // days?: {
  //   mon: boolean;
  //   tue: boolean;
  //   wed: boolean;
  //   thu: boolean;
  //   fri: boolean;
  //   sat: boolean;
  //   sun: boolean;
  // };
  // time?: {
  //   startTime: string;
  //   endTime: string;
  // };
}
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
    manageableTeams: Team[];
    likes: ScheduleLike[];
  };
}

// 공통 include 객체를 상수로 정의하여 DRY 원칙 적용
const SCHEDULE_INCLUDE = {
  hostTeam: true,
  invitedTeam: true,
  attendances: true,
  createdBy: true,
  likes: true,
} as const;

// 날짜 유틸리티 함수들
const DateUtils = {
  getStartOfDay(date: Date = new Date()): Date {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  },

  getEndOfDay(date: Date): Date {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  },

  getNextDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return nextDay;
  },
};

// 일정 조회를 위한 공통 where 조건 생성
function createScheduleWhereCondition(teamIds: string[]) {
  return {
    NOT: {
      status: { in: [ScheduleStatus.REJECTED, ScheduleStatus.DELETED] },
    },
    OR: [{ hostTeamId: { in: teamIds } }, { invitedTeamId: { in: teamIds } }],
  };
}

// 검색 조건 생성 함수
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

// 과거 일정 조회 (검색 기능 포함)
async function getPastSchedules(
  // searchQuery?: string
  filters?: ScheduleFilters
): Promise<ScheduleWithDetails[]> {
  const today = DateUtils.getStartOfDay();

  return prisma.schedule.findMany({
    where: {
      date: { lt: today },
      NOT: {
        status: {
          in: [
            ScheduleStatus.PENDING,
            ScheduleStatus.REJECTED,
            ScheduleStatus.READY,
            ScheduleStatus.DELETED,
          ],
        },
      },
      ...createSearchCondition(filters?.searchQuery),
      matchType: filters?.matchType,
    },
    include: SCHEDULE_INCLUDE,
    orderBy: { date: "desc" },
  }) as Promise<ScheduleWithDetails[]>;
}

// 사용자의 팀 정보 조회
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

// 오늘 일정 조회 (검색 기능 포함)
async function getTodaysSchedules(
  teamIds: string[],
  filters?: ScheduleFilters
): Promise<ScheduleWithDetails[]> {
  const today = DateUtils.getStartOfDay();
  const endOfToday = DateUtils.getEndOfDay(today);

  return prisma.schedule.findMany({
    where: {
      date: { gte: today, lte: endOfToday },
      ...createScheduleWhereCondition(teamIds),
      ...createSearchCondition(filters?.searchQuery),
      matchType: filters?.matchType,
    },
    include: SCHEDULE_INCLUDE,
    orderBy: { createdAt: "desc" },
  }) as Promise<ScheduleWithDetails[]>;
}

// 예정된 일정 조회 (검색 기능 포함)
async function getUpcomingSchedules(
  teamIds: string[],
  filters?: ScheduleFilters
): Promise<ScheduleWithDetails[]> {
  const tomorrow = DateUtils.getNextDay(DateUtils.getStartOfDay());

  return prisma.schedule.findMany({
    where: {
      date: { gte: tomorrow },
      ...createScheduleWhereCondition(teamIds),
      ...createSearchCondition(filters?.searchQuery),
      matchType: filters?.matchType,
    },
    include: SCHEDULE_INCLUDE,
    orderBy: { date: "asc" },
  }) as Promise<ScheduleWithDetails[]>;
}

export async function getSchedules(
  // searchQuery?: string,
  filters?: ScheduleFilters
): Promise<GetSchedulesResponse> {
  try {
    // 데이터베이스 연결 확인
    await prisma.$queryRaw`SELECT 1`;

    const pastSchedules = await getPastSchedules(filters);
    const session = await auth();

    // 로그인하지 않은 경우
    if (!session?.user?.id) {
      return {
        success: true,
        data: {
          todaysSchedules: [],
          upcomingSchedules: [],
          pastSchedules,
          manageableTeams: [],
          likes: [],
        },
      };
    }

    const { approvedTeamIds, manageableTeams } = await getUserTeamInfo(
      session.user.id
    );

    const [todaysSchedules, upcomingSchedules] = await Promise.all([
      // getTodaysSchedules(approvedTeamIds),
      // getUpcomingSchedules(approvedTeamIds),
      getTodaysSchedules(approvedTeamIds, filters),
      getUpcomingSchedules(approvedTeamIds, filters),
    ]);

    return {
      success: true,
      data: {
        pastSchedules,
        todaysSchedules,
        upcomingSchedules,
        manageableTeams,
        likes: [],
      },
    };
  } catch (error) {
    console.error("일정 목록 조회 실패:", error);

    // 데이터베이스 연결 오류인 경우 구체적인 메시지 제공
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
