"use server";

import { prisma } from "@/shared/lib/prisma";
// import { Prisma } from "@prisma/client";

// type PlayerWithTeams = Prisma.UserGetPayload<{
//   include: {
//     teams: {
//       include: {
//         team: true;
//       };
//     };
//   };
// }>;

// export async function getMyTeam(
//   id: string
// ): Promise<
//   { success: true; data: PlayerWithTeams } | { success: false; error: string }
// > {
export async function getTeam(id: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      return {
        success: false,
        error: "팀을 찾을 수 없습니다",
      };
    }

    return {
      success: true,
      data: {
        team,
      },
    };
  } catch (error) {
    console.error("팀 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
