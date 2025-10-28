"use server";

import { auth } from "@/shared/lib/auth";
import { decrypt } from "@/shared/lib/crypto";
import { prisma } from "@/shared/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

export interface Attendance {
  teamType: "HOST" | "INVITED";
  attendanceStatus: AttendanceStatus;
  user: {
    id: string;
    nickname: string;
    image: string;
  };
}

export async function getScheduleAttendance(scheduleId: string) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        hostTeamId: true,
        invitedTeamId: true,
        hostTeamMercenaryCount: true,
        invitedTeamMercenaryCount: true,
        createdById: true,
      },
    });

    if (!schedule) {
      return { success: false, error: "스케줄을 찾을 수 없습니다" };
    }

    const session = await auth();

    const [hostTeam, invitedTeam, userTeamMemberships] = await Promise.all([
      prisma.team.findUnique({
        where: { id: schedule?.hostTeamId },
        select: {
          name: true,
          logoUrl: true,
          id: true,
        },
      }),
      schedule?.invitedTeamId
        ? prisma.team.findUnique({
            where: { id: schedule.invitedTeamId },
            select: {
              name: true,
              logoUrl: true,
              id: true,
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
            name: manageableTeams.length > 0 ? true : false,
            isDeleted: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        hostTeam,
        invitedTeam,
        attendances: attendances.map((attendance) => ({
          ...attendance,
          user: {
            ...attendance.user,
            ...(attendance.user.name && {
              name: decrypt(attendance.user.name),
            }),
          },
        })),
        manageableTeams,
        isAuthor: schedule.createdById === session?.user?.id,
        schedule,
      },
    };
  } catch (error) {
    console.error("스케줄 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
