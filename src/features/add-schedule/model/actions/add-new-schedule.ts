"use server";

import { prisma } from "@/shared/lib/prisma";
import { MatchType, Schedule } from "@prisma/client";

export async function addNewSchedule({
  userId,
  teamId,
  data,
}: {
  userId: string;
  teamId: string;
  data: {
    place: string;
    date: string;
    startTime: string;
    endTime: string;
    matchType: string;
  };
}): Promise<
  { success: true; data: Schedule } | { success: false; error: string }
> {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return {
        success: false,
        error: "해당 팀이 존재하지 않습니다",
      };
    }

    const schedule = await prisma.schedule.create({
      data: {
        place: data.place,
        date: new Date(data.date),
        year: new Date(data.date).getFullYear(),
        startTime: new Date(`${data.date} ${data.startTime}`),
        endTime: new Date(`${data.date} ${data.endTime}`),
        matchType: data.matchType as MatchType,
        status: data.matchType === "TEAM" ? "PENDING" : "READY",
        createdById: userId,
        hostTeamId: teamId,
      },
    });

    if (!schedule) {
      return {
        success: false,
        error: "일정 추가에 실패했습니다",
      };
    }

    return {
      success: true,
      data: schedule,
    };
  } catch (error) {
    console.error("일정 추가 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
