"use server";

import { prisma } from "@/shared/lib/prisma";
import { ScheduleWithDetails } from "@/app/(main-layout)/schedules/actions/get-schedules";

interface GetTeamSchedulesParams {
  teamId: string;
  page?: number;
  pageSize?: number;
}

export interface GetTeamSchedulesResponse {
  success: boolean;
  error?: string;
  data?: {
    schedules: ScheduleWithDetails[];
    hasMore: boolean;
    nextPage?: number;
    total: number;
  };
}

export async function getTeamSchedules({
  teamId,
  page = 0,
  pageSize = 20,
}: GetTeamSchedulesParams): Promise<GetTeamSchedulesResponse> {
  try {
    // 먼저 팀이 존재하는지 확인
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return {
        success: false,
        error: "팀을 찾을 수 없습니다",
      };
    }

    // 총 개수 조회 (캐싱 최적화를 위해)
    const totalCount = await prisma.schedule.count({
      where: {
        OR: [{ hostTeamId: teamId }, { invitedTeamId: teamId }],
        // PENDING과 REJECTED 상태는 제외할 수도 있습니다
        // NOT: {
        //   status: { in: ["PENDING", "REJECTED"] },
        // },
      },
    });

    // 팀이 호스트이거나 초대받은 모든 경기 일정 조회
    const schedules = await prisma.schedule.findMany({
      where: {
        OR: [{ hostTeamId: teamId }, { invitedTeamId: teamId }],
        // PENDING과 REJECTED 상태는 제외할 수도 있습니다
        // NOT: {
        //   status: { in: ["PENDING", "REJECTED"] },
        // },
      },
      include: {
        hostTeam: true,
        invitedTeam: true,
        attendances: true,
        createdBy: true,
        likes: true,
      },
      orderBy: {
        date: "desc", // 최신 날짜 순
      },
      skip: page * pageSize,
      take: pageSize,
    });

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
    console.error("팀 경기 일정 조회 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}
