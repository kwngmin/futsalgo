"use server";

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addAttendances({
  scheduleId,
  teamId,
  teamType,
}: {
  scheduleId: string;
  teamId: string;
  teamType: "HOST" | "INVITED";
}) {
  try {
    const userIds = (
      await prisma.teamMember.findMany({
        where: {
          teamId,
          status: "APPROVED",
        },
        select: {
          userId: true,
        },
      })
    ).map((m) => m.userId);

    if (userIds.length === 0) {
      return {
        success: false,
        error: "팀원이 없습니다",
      };
    }

    // 이미 등록된 참석자 조회
    const existingAttendances = await prisma.scheduleAttendance.findMany({
      where: {
        scheduleId,
        userId: {
          in: userIds,
        },
      },
      select: {
        userId: true,
      },
    });

    const existingUserIds = new Set(existingAttendances.map((a) => a.userId));

    const newAttendances = userIds.filter(
      (userId) => !existingUserIds.has(userId)
    );

    if (newAttendances.length > 0) {
      await prisma.scheduleAttendance.createMany({
        data: newAttendances.map((userId) => ({
          scheduleId,
          userId,
          teamType,
          attendanceStatus: "UNDECIDED",
        })),
      });
    }

    revalidatePath(`/schedules/${scheduleId}/attendances/${teamId}`);

    return {
      success: true,
      message: "참석자 등록 완료",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "참석자 등록 중 오류가 발생했습니다",
    };
  }
}
