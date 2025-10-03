"use server";

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/shared/lib/auth";

export async function updateMercenaryCount({
  scheduleId,
  teamId,
  teamType,
  mercenaryCount,
}: {
  scheduleId: string;
  teamId: string;
  teamType: "HOST" | "INVITED";
  mercenaryCount: number;
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

    // 3. 용병 수 검증 (0 이상)
    if (mercenaryCount < 0) {
      return { success: false, error: "용병 수는 0 이상이어야 합니다." };
    }

    // 4. 용병 수 업데이트
    const updateData =
      teamType === "HOST"
        ? { hostTeamMercenaryCount: mercenaryCount }
        : { invitedTeamMercenaryCount: mercenaryCount };

    await prisma.schedule.update({
      where: {
        id: scheduleId,
      },
      data: updateData,
    });

    revalidatePath(`/schedules/${scheduleId}/attendances/${teamId}`);

    return {
      success: true,
      message: "용병 수가 업데이트되었습니다.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "용병 수 업데이트 중 오류가 발생했습니다.",
    };
  }
}
