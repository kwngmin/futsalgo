"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { revalidatePath } from "next/cache";

export async function likeSchedule({ scheduleId }: { scheduleId: string }) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 이미 좋아요 되어있는지 확인
    const existing = await prisma.scheduleLike.findUnique({
      where: {
        scheduleId_userId: {
          scheduleId,
          userId,
        },
      },
    });

    if (existing) {
      // 좋아요 취소
      await prisma.scheduleLike.delete({
        where: {
          scheduleId_userId: {
            scheduleId,
            userId,
          },
        },
      });

      return { success: true, liked: false, message: "좋아요 취소 완료" };
    } else {
      // 좋아요 추가
      await prisma.scheduleLike.create({
        data: {
          scheduleId,
          userId,
        },
      });

      return { success: true, liked: true, message: "좋아요 추가 완료" };
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "좋아요 업데이트 중 오류가 발생했습니다",
    };
  } finally {
    revalidatePath(`/schedule/${scheduleId}`);
  }
}
