"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export async function voteMvp(scheduleId: string, mvpUserId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 현재 사용자의 참석 정보 확인
    const currentAttendance = await prisma.scheduleAttendance.findUnique({
      where: {
        scheduleId_userId: {
          scheduleId,
          userId: session.user.id,
        },
      },
    });

    if (!currentAttendance) {
      return { success: false, error: "참석 정보를 찾을 수 없습니다" };
    }

    // 자기 자신에게 투표하는지 확인
    if (mvpUserId === session.user.id) {
      return { success: false, error: "자신에게는 투표할 수 없습니다" };
    }

    // MVP로 투표받을 사용자의 참석 정보 확인
    const targetAttendance = await prisma.scheduleAttendance.findUnique({
      where: {
        scheduleId_userId: {
          scheduleId,
          userId: mvpUserId,
        },
      },
    });

    if (!targetAttendance) {
      return { success: false, error: "투표 대상을 찾을 수 없습니다" };
    }

    await prisma.$transaction(async (tx) => {
      // 이전 투표가 있다면 해당 사용자의 MVP 점수 감소
      if (currentAttendance.mvpToUserId) {
        await tx.scheduleAttendance.update({
          where: {
            scheduleId_userId: {
              scheduleId,
              userId: currentAttendance.mvpToUserId,
            },
          },
          data: {
            mvpReceived: {
              decrement: 1,
            },
          },
        });
      }

      // 새로운 MVP 투표 업데이트
      await tx.scheduleAttendance.update({
        where: {
          scheduleId_userId: {
            scheduleId,
            userId: session.user.id,
          },
        },
        data: {
          mvpToUserId: mvpUserId,
        },
      });

      // 새로운 MVP의 점수 증가
      await tx.scheduleAttendance.update({
        where: {
          scheduleId_userId: {
            scheduleId,
            userId: mvpUserId,
          },
        },
        data: {
          mvpReceived: {
            increment: 1,
          },
        },
      });
    });

    revalidatePath(`/schedules/${scheduleId}/mvp`);

    return { success: true };
  } catch (error) {
    console.error("MVP 투표 실패:", error);
    return { success: false, error: "투표 처리 중 오류가 발생했습니다" };
  }
}
