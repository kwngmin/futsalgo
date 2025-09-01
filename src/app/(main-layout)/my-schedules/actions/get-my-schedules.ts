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
  };
}

export async function getMySchedules(): Promise<GetMySchedulesResponse> {
  try {
    const session = await auth();

    // 로그인하지 않은 경우
    if (!session?.user?.id) {
      return {
        success: false,
        error: "로그인이 필요합니다",
      };
    }

    // 사용자 + 소속 팀 정보 조회
    const player = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        teams: {
          where: {
            status: "APPROVED", // 승인된 팀만
          },
          include: {
            team: true,
          },
        },
      },
    });

    if (!player) {
      return {
        success: false,
        error: "사용자를 찾을 수 없습니다",
      };
    }

    // 내가 속한 팀 ID 목록 (APPROVED 상태)
    const approvedTeamIds = player.teams.map((t) => t.teamId);

    if (approvedTeamIds.length === 0) {
      return {
        success: true,
        data: {
          todaysSchedules: [],
          upcomingSchedules: [],
          pastSchedules: [],
        },
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduleInclude = {
      hostTeam: true,
      invitedTeam: true,
      attendances: true,
      createdBy: true,
      likes: true,
    };

    const scheduleFilter = {
      OR: [
        { hostTeamId: { in: approvedTeamIds } },
        { invitedTeamId: { in: approvedTeamIds } },
      ],
    };

    // 1. 오늘 일정 (모든 status 포함)
    const todaysSchedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        status: {
          not: "DELETED",
        },
        ...scheduleFilter,
      },
      include: scheduleInclude,
      orderBy: [{ startTime: "asc" }, { createdAt: "desc" }],
    });

    // 2. 예정된 일정 (내일 이후, 모든 status 포함)
    const upcomingSchedules = await prisma.schedule.findMany({
      where: {
        date: {
          gt: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        },
        status: {
          not: "DELETED",
        },
        ...scheduleFilter,
      },
      include: scheduleInclude,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // 3. 지난 일정 (어제 이전, 모든 status 포함)
    const pastSchedules = await prisma.schedule.findMany({
      where: {
        date: { lt: today },
        status: {
          not: "DELETED",
        },
        ...scheduleFilter,
      },
      include: scheduleInclude,
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });

    return {
      success: true,
      data: {
        todaysSchedules,
        upcomingSchedules,
        pastSchedules,
      },
    };
  } catch (error) {
    console.error("내 일정 목록 조회 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}
