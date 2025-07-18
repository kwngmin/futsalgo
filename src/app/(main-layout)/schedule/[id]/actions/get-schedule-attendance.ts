"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

export interface Attendance {
  teamType: "HOST" | "INVITED";
  attendanceStatus: AttendanceStatus;
  user: {
    id: string;
    nickname: string;
    image: string;
    // gender: string;
    // position: string;
    // skillLevel: string;
    // birthDate: string;
    // height: number;
  };
}

export async function getScheduleAttendance(scheduleId: string) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        // matchType: true,
        hostTeamId: true,
        invitedTeamId: true,
      },
    });

    if (!schedule) {
      return { success: false, error: "스케줄을 찾을 수 없습니다" };
    }

    const attendances = await prisma.scheduleAttendance.findMany({
      where: { scheduleId },
      select: {
        teamType: true,
        attendanceStatus: true,
        user: {
          select: {
            id: true,
            nickname: true,
            image: true,
            // gender: true,
            // position: true,
            // skillLevel: true,
            // birthDate: true,
            // height: true,
          },
        },
      },
    });

    const session = await auth();

    const [hostTeam, invitedTeam, userTeamMemberships] = await Promise.all([
      prisma.team.findUnique({
        where: { id: schedule?.hostTeamId },
        select: {
          name: true,
          logoUrl: true,
        },
      }),
      schedule?.invitedTeamId
        ? prisma.team.findUnique({
            where: { id: schedule.invitedTeamId },
            select: {
              name: true,
              logoUrl: true,
            },
          })
        : null,
      session?.user?.id
        ? prisma.teamMember.findMany({
            where: {
              userId: session.user.id,
              status: "APPROVED",
              teamId: {
                in: [schedule.hostTeamId, schedule.invitedTeamId].filter(
                  Boolean
                ) as string[],
              },
            },
            select: {
              teamId: true,
              role: true,
            },
          })
        : null,
    ]);

    // 관리 가능한 팀 결정
    const manageableTeams: Array<"host" | "invited"> = [];

    userTeamMemberships?.forEach((membership) => {
      if (membership.teamId === schedule.hostTeamId) {
        manageableTeams.push("host");
      }
      if (membership.teamId === schedule.invitedTeamId) {
        manageableTeams.push("invited");
      }
    });

    return {
      success: true,
      data: {
        hostTeam,
        invitedTeam,
        attendances,
        manageableTeams,
        schedule,
      },
    };
  } catch (error) {
    console.error("스케줄 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
