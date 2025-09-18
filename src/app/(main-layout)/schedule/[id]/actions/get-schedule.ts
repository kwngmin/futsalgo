"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function getSchedule(scheduleId: string) {
  try {
    // 1. 일정 정보는 로그인 여부와 관계없이 항상 조회
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        hostTeam: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
        invitedTeam: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
        attendances: true,
        matches: {
          include: {
            goals: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
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
    const session = await auth();
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

    // 4. 팀 멤버십 및 권한 확인 (한 번의 루프로 처리)
    let isManager: "HOST" | "GUEST" | null = null;
    let isMember = false;

    for (const teamMember of player.teams) {
      const { teamId, role } = teamMember;
      const isManagerRole = role === "OWNER" || role === "MANAGER";

      if (teamId === schedule.hostTeamId) {
        isMember = true;
        if (isManagerRole && !isManager) {
          isManager = "HOST";
        }
      } else if (teamId === schedule.invitedTeamId) {
        isMember = true;
        if (isManagerRole && !isManager) {
          isManager = "GUEST";
        }
      }

      // 두 팀 모두 확인했으면 루프 종료
      if (isManager && isMember) break;
    }

    return {
      success: true,
      data: {
        schedule,
        isManager,
        isMember,
      },
    };
  } catch (error) {
    console.error("스케줄 데이터 조회 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}
