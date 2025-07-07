"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function getSchedule(scheduleId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "사용자를 찾을 수 없습니다",
      };
    }

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

    if (myTeams.length === 0) {
      return {
        success: false,
        error: "내 팀이 없습니다",
      };
    }

    // const teamId = myTeams[0].teamId;

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        hostTeam: true,
        guestTeam: true,
        attendances: true,
        createdBy: true,
      },
    });

    // 세션이 없는 경우: user 없이 players만 전달
    return {
      success: true,
      data: { schedule, myTeam: myTeams },
    };
  } catch (error) {
    console.error("회원 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
