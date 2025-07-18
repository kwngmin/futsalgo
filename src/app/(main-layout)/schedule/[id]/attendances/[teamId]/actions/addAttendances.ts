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
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId,
        status: "APPROVED",
      },
    });

    if (teamMembers.length === 0) {
      return {
        success: false,
        error: "팀원이 없습니다",
      };
    }

    await prisma.scheduleAttendance.createMany({
      data: teamMembers.map((member) => ({
        scheduleId,
        userId: member.userId,
        teamType,
        attendanceStatus: "UNDECIDED",
      })),
    });

    revalidatePath(`/schedule/${scheduleId}/attendances/${teamId}`);
    // revalidatePath(`/schedule/${scheduleId}/attendances/${teamId}`);

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
