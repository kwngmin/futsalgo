"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { revalidatePath } from "next/cache";

export async function followTeam({ teamId }: { teamId: string }) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 이미 팔로우 되어있는지 확인
    const existing = await prisma.teamFollow.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (existing) {
      // 팔로우 취소 (언팔로우)
      await prisma.teamFollow.delete({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
      });

      return { success: true, isFollowing: false, message: "팔로우 취소 완료" };
    } else {
      // 팔로우 추가
      await prisma.teamFollow.create({
        data: {
          teamId,
          userId,
        },
      });

      return { success: true, isFollowing: true, message: "팔로우 추가 완료" };
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "팔로우 업데이트 중 오류가 발생했습니다",
    };
  } finally {
    revalidatePath(`/teams/${teamId}`);
  }
}
