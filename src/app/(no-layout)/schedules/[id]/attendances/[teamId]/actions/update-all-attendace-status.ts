"use server";

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";
import { auth } from "@/shared/lib/auth";

// 전체 참석처리 액션
export async function updateAllAttendanceStatus({
  scheduleId,
  teamId,
  teamType,
  attendanceStatus,
}: {
  scheduleId: string;
  teamId: string;
  teamType: "HOST" | "INVITED";
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

    // 2. currentUser가 해당 팀에 소속되어 있고 권한이 있는지 확인
    const userTeamInfo = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: currentUserId,
        status: "APPROVED",
      },
    });

    if (!userTeamInfo || !["OWNER", "MANAGER"].includes(userTeamInfo.role)) {
      return { success: false, error: "수정 권한이 없습니다." };
    }

    // 3. 해당 팀의 모든 참석자 상태 업데이트
    const updateResult = await prisma.scheduleAttendance.updateMany({
      where: {
        scheduleId,
        teamType,
      },
      data: {
        attendanceStatus,
        votedAt: new Date(),
      },
    });

    revalidatePath(`/schedules/${scheduleId}`);

    return {
      success: true,
      message: `${updateResult.count}명의 참석 상태가 업데이트되었습니다.`,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "전체 참석처리 중 오류가 발생했습니다.",
    };
  }
}
