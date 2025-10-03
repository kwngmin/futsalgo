"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export type DeleteScheduleReturn =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function deleteSchedule(
  scheduleId: string
): Promise<DeleteScheduleReturn> {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: "로그인이 필요합니다",
    };
  }

  try {
    // 기존 일정 조회
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        id: true,
        status: true,
        createdById: true,
      },
    });

    if (!existingSchedule) {
      return {
        success: false,
        error: "일정을 찾을 수 없습니다",
      };
    }

    // 권한 체크 (생성자만 삭제 가능)
    // TODO: 추후 팀장/부팀장 권한도 추가할 수 있음
    if (existingSchedule.createdById !== userId) {
      return {
        success: false,
        error: "일정을 삭제할 권한이 없습니다",
      };
    }

    // 이미 삭제된 일정인지 확인
    if (existingSchedule.status === "DELETED") {
      return {
        success: false,
        error: "이미 삭제된 일정입니다",
      };
    }

    // 일정을 DELETED 상태로 변경 (실제 삭제하지 않고 상태만 변경)
    await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: "DELETED",
      },
    });

    revalidatePath("/schedule");
    revalidatePath(`/schedule/${scheduleId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("일정 삭제 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}
