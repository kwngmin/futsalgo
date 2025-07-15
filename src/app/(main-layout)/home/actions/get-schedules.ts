"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function getSchedules() {
  try {
    const session = await auth();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // 1. 과거 일정 조회 (어제 이전 날짜 + PENDING, REJECTED 제외)
    const pastSchedules = await prisma.schedule.findMany({
      where: {
        date: { lt: today }, // ← 어제 날짜까지 포함
        NOT: {
          status: { in: ["PENDING", "REJECTED"] },
        },
      },
      include: {
        hostTeam: true,
        invitedTeam: true,
        createdBy: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // 로그인하지 않은 경우 → pastSchedules만 반환
    if (!session?.user?.id) {
      return {
        success: true,
        data: {
          pastSchedules,
          manageableTeams: [],
        },
      };
    }

    // 2. 사용자 + 소속 팀 정보 조회
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

    // 3. 내가 속한 팀 ID 목록 (APPROVED 상태)
    const approvedTeamIds = player.teams.map((t) => t.teamId);

    // 4. 그중 OWNER 또는 MANAGER 권한이 있는 팀
    const manageableTeams = player.teams
      .filter((t) => t.role === "OWNER" || t.role === "MANAGER")
      .map((t) => t.team);

    // 5. 오늘부터 이후 일정만 조회 (APPROVED 된 팀 기준)
    const upcomingSchedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: today, // ← 오늘 포함
        },
        OR: [
          { hostTeamId: { in: approvedTeamIds } },
          { invitedTeamId: { in: approvedTeamIds } },
        ],
      },
      include: {
        hostTeam: true,
        invitedTeam: true,
        attendances: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: {
        pastSchedules,
        upcomingSchedules,
        manageableTeams,
      },
    };
  } catch (error) {
    console.error("일정 목록 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
