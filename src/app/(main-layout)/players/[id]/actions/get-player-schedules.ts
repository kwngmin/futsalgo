"use server";

import { prisma } from "@/shared/lib/prisma";
import { ScheduleWithDetails } from "@/app/(main-layout)/home/actions/get-schedules";

interface GetUserSchedulesParams {
  userId: string;
  page?: number;
  pageSize?: number;
}

export interface GetUserSchedulesResponse {
  success: boolean;
  error?: string;
  data?: {
    schedules: ScheduleWithDetails[];
    hasMore: boolean;
    nextPage?: number;
    total: number;
  };
}

export async function getPlayerSchedules({
  userId,
  page = 0,
  pageSize = 20,
}: GetUserSchedulesParams): Promise<GetUserSchedulesResponse> {
  try {
    // 먼저 사용자가 존재하는지 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "사용자를 찾을 수 없습니다",
      };
    }

    // 총 개수 조회 (캐싱 최적화를 위해)
    const totalCount = await prisma.scheduleAttendance.count({
      where: {
        userId,
        attendanceStatus: "ATTENDING",
      },
    });

    // 사용자가 참석(ATTENDING)한 일정 조회
    const scheduleAttendances = await prisma.scheduleAttendance.findMany({
      where: {
        userId,
        attendanceStatus: "ATTENDING",
      },
      include: {
        schedule: {
          include: {
            hostTeam: true,
            invitedTeam: true,
            attendances: true,
            createdBy: true,
            likes: true,
          },
        },
      },
      orderBy: {
        schedule: {
          date: "desc", // 최신 날짜 순
        },
      },
      skip: page * pageSize,
      take: pageSize,
    });

    // Schedule 데이터만 추출
    const schedules = scheduleAttendances.map(
      (attendance) => attendance.schedule
    );

    const hasMore = totalCount > (page + 1) * pageSize;
    const nextPage = hasMore ? page + 1 : undefined;

    return {
      success: true,
      data: {
        schedules,
        hasMore,
        nextPage,
        total: totalCount,
      },
    };
  } catch (error) {
    console.error("사용자 경기일정 조회 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}
