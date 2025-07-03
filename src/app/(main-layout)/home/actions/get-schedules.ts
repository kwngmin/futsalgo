"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function getSchedules() {
  try {
    const session = await auth();
    const player = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      include: {
        teams: {
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

    const myTeams = player.teams.filter(
      (team) =>
        team.team.status === "ACTIVE" &&
        (team.role === "MANAGER" || team.role === "OWNER")
    );

    const teamId = myTeams[0].teamId;

    const hostSchedules = await prisma.schedule.findMany({
      where: {
        OR: [{ hostTeamId: teamId }],
      },
      include: {
        hostTeam: true,
        guestTeam: true,
        attendances: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const guestSchedules = await prisma.schedule.findMany({
      where: {
        OR: [{ guestTeamId: teamId }],
      },
      include: {
        hostTeam: true,
        guestTeam: true,
        attendances: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 세션이 없는 경우: user 없이 players만 전달
    return {
      success: true,
      data: { hostSchedules, guestSchedules },
    };
  } catch (error) {
    console.error("선수 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
