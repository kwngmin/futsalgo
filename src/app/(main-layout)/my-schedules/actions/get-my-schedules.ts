"use server";

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
    todaysSchedules: ScheduleWithDetails[];
    upcomingSchedules: ScheduleWithDetails[];
    pastSchedules: ScheduleWithDetails[];
    myTeams: Team[];
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
function getStartOfDay(date: Date = new Date()): Date {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

function getEndOfDay(date: Date): Date {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

function getNextDay(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  return nextDay;
}

// 일정 조회를 위한 공통 where 조건 생성
function createScheduleWhereCondition(teamIds: string[]) {
  return {
    status: { not: "DELETED" as const },
    OR: [{ hostTeamId: { in: teamIds } }, { invitedTeamId: { in: teamIds } }],
  };
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
  const myTeams = player.teams.map((t) => t.team);

  return {
    approvedTeamIds,
    myTeams,
  };
}

// 오늘 일정 조회
async function getTodaysSchedules(
  teamIds: string[]
): Promise<ScheduleWithDetails[]> {
  const today = getStartOfDay();
  const endOfToday = getEndOfDay(today);

  return prisma.schedule.findMany({
    where: {
      date: { gte: today, lte: endOfToday },
      ...createScheduleWhereCondition(teamIds),
    },
    include: SCHEDULE_INCLUDE,
    orderBy: [{ startTime: "asc" }, { createdAt: "desc" }],
  });
}

// 예정된 일정 조회
async function getUpcomingSchedules(
  teamIds: string[]
): Promise<ScheduleWithDetails[]> {
  const tomorrow = getNextDay(getStartOfDay());

  return prisma.schedule.findMany({
    where: {
      date: { gte: tomorrow },
      ...createScheduleWhereCondition(teamIds),
    },
    include: SCHEDULE_INCLUDE,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

// 과거 일정 조회
async function getPastSchedules(
  teamIds: string[]
): Promise<ScheduleWithDetails[]> {
  const today = getStartOfDay();

  return prisma.schedule.findMany({
    where: {
      date: { lt: today },
      ...createScheduleWhereCondition(teamIds),
    },
    include: SCHEDULE_INCLUDE,
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });
}

export async function getMySchedules(): Promise<GetMySchedulesResponse> {
  try {
    // 데이터베이스 연결 확인
    await prisma.$queryRaw`SELECT 1`;

    const session = await auth();

    // 로그인하지 않은 경우
    if (!session?.user?.id) {
      return {
        success: false,
        error: "로그인이 필요합니다",
      };
    }

    const { approvedTeamIds, myTeams } = await getUserTeamInfo(session.user.id);

    // 팀에 속하지 않은 경우
    if (approvedTeamIds.length === 0) {
      return {
        success: true,
        data: {
          todaysSchedules: [],
          upcomingSchedules: [],
          pastSchedules: [],
          myTeams: [],
        },
      };
    }

    const [todaysSchedules, upcomingSchedules, pastSchedules] =
      await Promise.all([
        getTodaysSchedules(approvedTeamIds),
        getUpcomingSchedules(approvedTeamIds),
        getPastSchedules(approvedTeamIds),
      ]);

    return {
      success: true,
      data: {
        todaysSchedules,
        upcomingSchedules,
        pastSchedules,
        myTeams,
      },
    };
  } catch (error) {
    console.error("내 일정 목록 조회 실패:", error);

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
