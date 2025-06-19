"use server";

import { prisma } from "@/shared/lib/prisma";

export async function getPlayer(id: string) {
  try {
    const player = await prisma.user.findUnique({
      where: { id },
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
        error: "선수를 찾을 수 없습니다",
      };
    }

    const filteredTeams = player.teams.filter(
      (team) => team.team.status === "ACTIVE"
    );

    return {
      success: true,
      data: {
        ...player,
        teams: filteredTeams,
      },
    };
  } catch (error) {
    console.error("선수 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
