"use server";

import { prisma } from "@/shared/lib/prisma";
import { ExistingSchedule } from "../../../../app/(no-layout)/schedule/[id]/edit/ui/EditScheduleForm";

export type GetScheduleReturn =
  | {
      success: true;
      data: ExistingSchedule;
    }
  | {
      success: false;
      error: string;
    };

export async function getScheduleById(id: string): Promise<GetScheduleReturn> {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      select: {
        id: true,
        place: true,
        description: true,
        date: true,
        startTime: true,
        endTime: true,
        matchType: true,
        city: true,
        district: true,
        enableAttendanceVote: true,
        attendanceDeadline: true,
        hostTeamId: true,
        invitedTeamId: true,
        invitedTeam: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true,
            level: true,
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

    // 날짜를 YYYY-MM-DD 형식으로 변환
    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    // 시간을 HH:MM 형식으로 변환
    const formatTime = (date: Date) => {
      return date.toTimeString().slice(0, 5);
    };

    const formattedSchedule: ExistingSchedule = {
      id: schedule.id,
      place: schedule.place,
      description: schedule.description || undefined,
      date: formatDate(schedule.date),
      startTime: formatTime(schedule.startTime),
      endTime: formatTime(schedule.endTime),
      matchType: schedule.matchType as "SQUAD" | "TEAM",
      city: schedule.city || undefined,
      district: schedule.district || undefined,
      enableAttendanceVote: schedule.enableAttendanceVote,
      attendanceDeadline: schedule.attendanceDeadline
        ? formatDate(schedule.attendanceDeadline)
        : undefined,
      hostTeamId: schedule.hostTeamId,
      invitedTeamId: schedule.invitedTeamId || undefined,
      invitedTeam: schedule.invitedTeam || undefined,
    };

    return {
      success: true,
      data: formattedSchedule,
    };
  } catch (error) {
    console.error("일정 조회 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}
