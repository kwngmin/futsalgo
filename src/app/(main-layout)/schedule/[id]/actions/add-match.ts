"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function addMatch(scheduleId: string) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        hostTeamId: true,
        invitedTeamId: true,
        matchType: true,
      },
    });

    if (!schedule) {
      return { success: false, error: "스케줄을 찾을 수 없습니다" };
    }

    if (schedule.matchType === "TEAM" && !schedule.invitedTeamId) {
      return { success: false, error: "초대된 팀이 없습니다" };
    }

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 로그인 및 유저 확인
    const attendance = await prisma.scheduleAttendance.findUnique({
      where: {
        scheduleId_userId: {
          scheduleId,
          userId,
        },
      },
      select: {
        teamType: true,
      },
    });

    if (!attendance) {
      return { success: false, error: "참석자가 아닙니다" };
    }

    // awayTeamId 결정
    const awayTeamId =
      schedule.matchType === "TEAM"
        ? schedule.invitedTeamId!
        : schedule.hostTeamId;

    const match = await prisma.match.create({
      data: {
        scheduleId,
        createdById: userId,
        homeTeamId: schedule.hostTeamId,
        awayTeamId, // ← null 불가, 조건에 따라 안전하게 처리됨
      },
    });

    if (schedule.matchType === "TEAM") {
      // 로그인 및 유저 확인
      const attendances = await prisma.scheduleAttendance.findMany({
        where: {
          scheduleId,
          attendanceStatus: "ATTENDING",
        },
        select: {
          userId: true,
          teamType: true,
        },
      });

      await prisma.lineup.createMany({
        data: attendances.map((attendance) => ({
          matchId: match.id,
          userId: attendance.userId,
          side: attendance.teamType === "HOST" ? "HOME" : "AWAY",
        })),
      });
    }

    return {
      success: true,
      data: match,
    };
  } catch (error) {
    console.error("스케줄 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
