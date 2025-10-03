"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";

export type UpdateAttendanceStatusReturn =
  | {
      success: true;
      data: {
        attendanceStatus: AttendanceStatus;
      };
    }
  | {
      success: false;
      error: string;
    };

export async function updateAttendanceStatus(
  scheduleId: string,
  attendanceStatus: "ATTENDING" | "NOT_ATTENDING"
): Promise<UpdateAttendanceStatusReturn> {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: "로그인이 필요합니다",
    };
  }

  try {
    // 1. 일정 정보 조회 및 유효성 검사
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        id: true,
        status: true,
        enableAttendanceVote: true,
        attendanceDeadline: true,
        attendances: {
          where: { userId },
          select: {
            id: true,
            attendanceStatus: true,
          },
        },
      },
    });

    if (!schedule) {
      return {
        success: false,
        error: "일정을 찾을 수 없습니다",
      };
    }

    // 2. 참석 투표 활성화 여부 확인
    if (!schedule.enableAttendanceVote) {
      return {
        success: false,
        error: "참석 투표가 활성화되지 않은 일정입니다",
      };
    }

    // 3. 투표 마감 시간 확인
    if (
      schedule.attendanceDeadline &&
      schedule.attendanceDeadline <= new Date()
    ) {
      return {
        success: false,
        error: "참석 투표 마감 시간이 지났습니다",
      };
    }

    // 4. 일정 상태 확인
    if (schedule.status !== "READY") {
      return {
        success: false,
        error: "참석 투표가 불가능한 일정 상태입니다",
      };
    }

    // 5. 사용자의 참석 정보가 있는지 확인
    if (schedule.attendances.length === 0) {
      return {
        success: false,
        error: "해당 일정에 참석할 권한이 없습니다",
      };
    }

    // 6. 참석 상태 업데이트
    const attendance = schedule.attendances[0];
    const updatedAttendance = await prisma.scheduleAttendance.update({
      where: { id: attendance.id },
      data: {
        attendanceStatus: attendanceStatus,
        votedAt: new Date(),
      },
    });

    // 7. 캐시 무효화
    revalidatePath(`/schedule/${scheduleId}`);
    revalidatePath("/");

    return {
      success: true,
      data: {
        attendanceStatus: updatedAttendance.attendanceStatus,
      },
    };
  } catch (error) {
    console.error("참석 상태 업데이트 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}
