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
    schedules: ScheduleWithDetails[];
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

// 날짜 유틸리티 함수들을 별도 파일로 분리하는 것을 고려해보세요
// utils/date-helpers.ts
// function getStartOfDay(date: Date = new Date()): Date {
//   const startOfDay = new Date(date);
//   startOfDay.setHours(0, 0, 0, 0);
//   return startOfDay;
// }

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

  return {
    approvedTeamIds: player.teams.map((t) => t.teamId),
    myTeams: player.teams.map((t) => t.team),
  };
}

// 모든 일정을 조회하는 통합 함수
async function getAllSchedules(
  teamIds: string[]
): Promise<ScheduleWithDetails[]> {
  // const today = getStartOfDay();

  return prisma.schedule.findMany({
    where: createScheduleWhereCondition(teamIds),
    include: SCHEDULE_INCLUDE,
    orderBy: [
      // 오늘 날짜 기준으로 미래 일정은 오름차순, 과거 일정은 내림차순
      {
        date: "desc",
      },
      // 날짜가 같은 경우 시간순 정렬
      {
        startTime: "desc",
      },
      // 동일 시간대 일정은 최신 생성순
      {
        createdAt: "desc",
      },
    ],
  });
}

// 에러 처리를 위한 헬퍼 함수
function handleDatabaseError(error: unknown): string {
  if (
    error instanceof Error &&
    error.message.includes("Can't reach database server")
  ) {
    return "데이터베이스 서버에 연결할 수 없습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.";
  }
  return "서버 오류가 발생했습니다";
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
          schedules: [],
          myTeams: [],
        },
      };
    }

    // 모든 일정을 한 번에 조회
    const schedules = await getAllSchedules(approvedTeamIds);

    return {
      success: true,
      data: {
        schedules,
        myTeams,
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
