"use server";

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";
import { auth } from "@/shared/lib/auth";

export async function updateAttendance({
  scheduleId,
  teamId,
  teamType,
  attendanceId,
  attendanceStatus,
}: {
  scheduleId: string;
  teamId: string;
  teamType: "HOST" | "INVITED";
  attendanceId: string;
  attendanceStatus: AttendanceStatus;
}) {
  try {
    const session = await auth();
    const currentUserId = session?.user.id;

    if (!currentUserId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 1. 스케줄 존재 여부 확인 + teamType이 맞는지 검증
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        hostTeamId: true,
        invitedTeamId: true,
      },
    });

    if (!schedule) {
      return { success: false, error: "해당 일정이 존재하지 않습니다." };
    }

    const validTeamMatch =
      (teamType === "HOST" && schedule.hostTeamId === teamId) ||
      (teamType === "INVITED" && schedule.invitedTeamId === teamId);

    if (!validTeamMatch) {
      return { success: false, error: "팀 정보가 일정과 일치하지 않습니다." };
    }

    // 2. currentUser가 해당 팀에 소속되어 있는지 확인
    const isRequesterTeamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: currentUserId,
        status: "APPROVED",
      },
    });

    if (!isRequesterTeamMember) {
      return { success: false, error: "수정 권한이 없습니다." };
    }

    // 3. 참석 명단에 대상 유저가 포함되어 있고, 같은 teamType인지 확인
    const targetAttendance = await prisma.scheduleAttendance.findUnique({
      where: {
        id: attendanceId,
      },
    });

    if (!targetAttendance) {
      return { success: false, error: "대상 회원의 참석 정보가 없습니다." };
    }

    if (targetAttendance.teamType !== teamType) {
      return { success: false, error: "대상 회원이 같은 팀 소속이 아닙니다." };
    }

    // 4. 참석 상태 업데이트
    await prisma.scheduleAttendance.update({
      where: {
        id: attendanceId,
      },
      data: {
        attendanceStatus,
      },
    });

    revalidatePath(`/schedules/${scheduleId}/attendances/${teamId}`);

    return {
      success: true,
      message: "참석자 수정 완료",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "참석자 수정 중 오류가 발생했습니다",
    };
  }
}
