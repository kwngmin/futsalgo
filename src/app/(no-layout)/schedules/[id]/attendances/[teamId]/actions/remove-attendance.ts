"use server";

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/shared/lib/auth";

// 참석자 삭제 액션
export async function removeAttendance({
  scheduleId,
  teamId,
  teamType,
  attendanceId,
}: {
  scheduleId: string;
  teamId: string;
  teamType: "HOST" | "INVITED";
  attendanceId: string;
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

    // 2. currentUser가 해당 팀에 소속되어 있고 권한이 있는지 확인
    const userTeamInfo = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: currentUserId,
        status: "APPROVED",
      },
    });

    if (!userTeamInfo || !["OWNER", "MANAGER"].includes(userTeamInfo.role)) {
      return { success: false, error: "삭제 권한이 없습니다." };
    }

    // 3. 참석 명단에 대상 유저가 포함되어 있고, 같은 teamType인지 확인
    const targetAttendance = await prisma.scheduleAttendance.findUnique({
      where: {
        id: attendanceId,
      },
      include: {
        user: {
          select: {
            nickname: true,
            name: true,
          },
        },
      },
    });

    if (!targetAttendance) {
      return { success: false, error: "대상 회원의 참석 정보가 없습니다." };
    }

    if (targetAttendance.teamType !== teamType) {
      return { success: false, error: "대상 회원이 같은 팀 소속이 아닙니다." };
    }

    // 4. 참석자 삭제
    await prisma.scheduleAttendance.delete({
      where: {
        id: attendanceId,
      },
    });

    revalidatePath(`/schedules/${scheduleId}/attendances/${teamId}`);

    return {
      success: true,
      message: `${targetAttendance.user.nickname}님이 참석자 명단에서 제거되었습니다.`,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "참석자 삭제 중 오류가 발생했습니다.",
    };
  }
}
