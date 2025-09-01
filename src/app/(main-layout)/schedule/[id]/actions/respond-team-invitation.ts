"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { InvitationStatus, ScheduleStatus } from "@prisma/client";

export type RespondTeamInvitationReturn =
  | {
      success: true;
      data: {
        status: InvitationStatus;
        scheduleStatus: ScheduleStatus;
      };
    }
  | {
      success: false;
      error: string;
    };

export async function respondTeamInvitation(
  scheduleId: string,
  response: "ACCEPT" | "DECLINE",
  reason?: string
): Promise<RespondTeamInvitationReturn> {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: "로그인이 필요합니다",
    };
  }

  try {
    // 1. 일정과 초청 정보 조회
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        invitation: true,
        invitedTeam: {
          include: {
            members: {
              where: {
                userId: userId,
                status: "APPROVED",
                role: { in: ["OWNER", "MANAGER"] },
              },
            },
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

    if (!schedule.invitation) {
      return {
        success: false,
        error: "초청 정보를 찾을 수 없습니다",
      };
    }

    // 2. 권한 체크: 초청받은 팀의 OWNER 또는 MANAGER인지 확인
    if (schedule.invitedTeam?.members.length === 0) {
      return {
        success: false,
        error: "초청을 수락/거절할 권한이 없습니다",
      };
    }

    // 3. 이미 응답된 초청인지 확인
    if (schedule.invitation.status !== "PENDING") {
      return {
        success: false,
        error: "이미 응답된 초청입니다",
      };
    }

    // 4. 이미 삭제된 일정인지 확인
    if (schedule.status === "DELETED") {
      return {
        success: false,
        error: "삭제된 일정입니다",
      };
    }

    // 5. 트랜잭션으로 초청 응답과 일정 상태 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 초청 상태 업데이트
      const updatedInvitation = await tx.teamMatchInvitation.update({
        where: { id: schedule.invitation!.id },
        data: {
          status: response === "ACCEPT" ? "ACCEPTED" : "DECLINED",
          reason: response === "DECLINE" ? reason : null,
        },
      });

      // 일정 상태 업데이트
      const newScheduleStatus: ScheduleStatus =
        response === "ACCEPT" ? "READY" : "REJECTED";

      const updatedSchedule = await tx.schedule.update({
        where: { id: scheduleId },
        data: {
          status: newScheduleStatus,
        },
      });

      return {
        invitation: updatedInvitation,
        schedule: updatedSchedule,
      };
    });

    // 6. 캐시 무효화
    revalidatePath(`/schedule/${scheduleId}`);
    revalidatePath("/");
    revalidatePath("/my-schedules");

    return {
      success: true,
      data: {
        status: result.invitation.status,
        scheduleStatus: result.schedule.status,
      },
    };
  } catch (error) {
    console.error("팀 초청 응답 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}
