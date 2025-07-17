"use server";

import { prisma } from "@/shared/lib/prisma";

export async function getInvitedTeam(teamCode: string) {
  try {
    const team = await prisma.team.findUnique({
      where: {
        code: teamCode,
      },
    });

    if (!team) {
      return { success: false, error: "초청팀 정보를 불러올 수 없습니다." };
    }

    return {
      success: true,
      data: team,
    };
  } catch (error) {
    console.error("초청팀 정보 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
