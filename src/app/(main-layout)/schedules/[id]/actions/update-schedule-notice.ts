"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export type UpdateScheduleNoticeReturn =
  | {
      success: true;
      data: {
        description: string | null;
      };
    }
  | {
      success: false;
      error: string;
    };

export async function updateScheduleNotice(
  scheduleId: string,
  description: string
): Promise<UpdateScheduleNoticeReturn> {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: "로그인이 필요합니다",
    };
  }

  try {
    // 기존 일정 조회 및 권한 체크
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

    // 권한 체크 (생성자만 수정 가능)
    if (existingSchedule.createdById !== userId) {
      return {
        success: false,
        error: "공지사항을 수정할 권한이 없습니다",
      };
    }

    // 삭제된 일정은 수정 불가
    if (existingSchedule.status === "DELETED") {
      return {
        success: false,
        error: "삭제된 일정은 수정할 수 없습니다",
      };
    }

    // 빈 내용이면 null로 저장, 아니면 그대로 저장
    const finalDescription =
      description.trim() === "" ? null : description.trim();

    // 공지사항 업데이트
    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        description: finalDescription,
      },
      select: {
        description: true,
      },
    });

    revalidatePath(`/schedule/${scheduleId}`);
    revalidatePath("/");
    revalidatePath("/my-schedules");

    return {
      success: true,
      data: {
        description: updatedSchedule.description,
      },
    };
  } catch (error) {
    console.error("공지사항 업데이트 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}
