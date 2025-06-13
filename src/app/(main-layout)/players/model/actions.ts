"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function getPlayers() {
  try {
    // 1. 사용자 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "인증이 필요합니다" };
    }

    const players = await prisma.user.findMany({
      where: {
        NOT: {
          id: session.user.id,
        },
      },
    });

    return { success: true, data: players };
  } catch (error) {
    console.error("선수 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
