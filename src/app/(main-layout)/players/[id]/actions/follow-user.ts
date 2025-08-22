"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { revalidatePath } from "next/cache";

export async function followUser({ userId }: { userId: string }) {
  try {
    const session = await auth();
    const currentUserId = session?.user.id;

    if (!currentUserId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 자기 자신을 팔로우하는 것 방지
    if (currentUserId === userId) {
      return { success: false, error: "자기 자신을 팔로우할 수 없습니다." };
    }

    // 이미 팔로우 되어있는지 확인
    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    if (existing) {
      // 팔로우 취소 (언팔로우)
      await prisma.userFollow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });

      return { success: true, isFollowing: false, message: "팔로우 취소 완료" };
    } else {
      // 팔로우 추가
      await prisma.userFollow.create({
        data: {
          followerId: currentUserId,
          followingId: userId,
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
    revalidatePath(`/players/${userId}`);
  }
}
