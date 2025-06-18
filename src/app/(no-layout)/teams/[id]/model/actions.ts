"use server";

// import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function getTeam(id: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            members: {
              where: {
                status: "APPROVED",
              },
            },
            followers: true,
          },
        },
      },
    });

    // 비로그인 사용자의 경우
    return {
      success: true,
      data: {
        team,
      },
    };
  } catch (error) {
    console.error("팀 데이터 조회 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
      data: null,
    };
  }
}
