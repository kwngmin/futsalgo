"use server";

import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@prisma/client";

type PlayerWithTeams = Prisma.UserGetPayload<{
  include: {
    teams: {
      include: {
        team: true;
      };
    };
  };
}>;

export async function getMyTeam(
  id: string
): Promise<
  { success: true; data: PlayerWithTeams } | { success: false; error: string }
> {
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
        error: "회원을 찾을 수 없습니다",
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
    console.error("회원 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
