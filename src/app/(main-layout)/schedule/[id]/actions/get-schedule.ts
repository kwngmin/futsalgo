"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function getSchedule(scheduleId: string) {
  try {
    const session = await auth();

    // 1. 일정 정보는 로그인 여부와 관계없이 항상 조회
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        hostTeam: true,
        invitedTeam: true,
        attendances: true,
        createdBy: true,
      },
    });

    if (!schedule) {
      return {
        success: false,
        error: "일정을 찾을 수 없습니다",
      };
    }

    // 2. 로그인하지 않은 경우 → 일정만 리턴
    if (!session?.user?.id) {
      return {
        success: true,
        data: {
          schedule,
        },
      };
    }

    // 3. 사용자와 승인된 소속 팀 정보 조회
    const player = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        teams: {
          where: { status: "APPROVED" },
          include: { team: true },
        },
      },
    });

    if (!player) {
      return {
        success: false,
        error: "사용자를 찾을 수 없습니다",
      };
    }

    // 4. 내가 관리자 권한을 가진 팀인지 확인
    let isManager: "HOST" | "GUEST" | null = null;

    for (const teamMember of player.teams) {
      if (
        teamMember.teamId === schedule.hostTeamId &&
        (teamMember.role === "OWNER" || teamMember.role === "MANAGER")
      ) {
        isManager = "HOST";
        break;
      }
      if (
        teamMember.teamId === schedule.invitedTeamId &&
        (teamMember.role === "OWNER" || teamMember.role === "MANAGER")
      ) {
        isManager = "GUEST";
        break;
      }
    }

    return {
      success: true,
      data: {
        schedule,
        isManager, // "HOST" | "GUEST" | null
      },
    };
  } catch (error) {
    console.error("스케줄 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
