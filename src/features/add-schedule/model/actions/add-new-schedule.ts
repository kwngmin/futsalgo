"use server";

import { prisma } from "@/shared/lib/prisma";
import { MatchType, Schedule } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function addNewSchedule({
  createdById,
  formData,
}: {
  createdById: string;
  formData: {
    hostTeamId: string;
    invitedTeamId?: string;
    place: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    matchType: string;
    city?: string;
    district?: string;
    enableAttendanceVote: boolean;
    attendanceDeadline?: string;
    attendanceEndTime?: string;
  };
}): Promise<
  { success: true; data: Schedule } | { success: false; error: string }
> {
  try {
    const hostTeam = await prisma.team.findUnique({
      where: { id: formData.hostTeamId },
    });

    if (!hostTeam) {
      return {
        success: false,
        error: "해당 팀이 존재하지 않습니다",
      };
    }

    const schedule = await prisma.schedule.create({
      data: {
        place: formData.place,
        date: new Date(formData.date),
        year: new Date(formData.date).getFullYear(),
        startTime: new Date(`${formData.date} ${formData.startTime}`),
        endTime: new Date(`${formData.date} ${formData.endTime}`),
        matchType: formData.matchType as MatchType,
        status: formData.matchType === "TEAM" ? "PENDING" : "READY",
        createdById: createdById,
        hostTeamId: formData.hostTeamId,
        invitedTeamId: formData.invitedTeamId,
        description: formData.description,
        city: formData.city,
        district: formData.district,
        enableAttendanceVote: formData.enableAttendanceVote,
        attendanceDeadline: formData.attendanceDeadline,
      },
    });

    if (!schedule) {
      return {
        success: false,
        error: "일정 추가에 실패했습니다",
      };
    }

    revalidatePath("/");

    return {
      success: true,
      data: schedule,
    };
  } catch (error) {
    console.error("일정 추가 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
