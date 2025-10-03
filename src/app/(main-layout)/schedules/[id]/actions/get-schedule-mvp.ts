"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

export interface MvpAttendance {
  userId: string;
  teamType: "HOST" | "INVITED";
  attendanceStatus: AttendanceStatus;
  mvpReceived: number;
  mvpToUserId: string | null;
  user: {
    id: string;
    nickname: string | null;
    name: string | null;
    image: string | null;
  };
}

export interface MvpStats {
  voted: number;
  notVoted: number;
  voteRate: number;
}

export async function getScheduleMvp(scheduleId: string) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        hostTeamId: true,
        invitedTeamId: true,
      },
    });

    if (!schedule) {
      return { success: false, error: "스케줄을 찾을 수 없습니다" };
    }

    const session = await auth();
    const currentUserId = session?.user?.id;

    const [hostTeam, invitedTeam, userTeamMemberships, currentUserAttendance] =
      await Promise.all([
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
        currentUserId
          ? prisma.teamMember.findMany({
              where: {
                userId: currentUserId,
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
        currentUserId
          ? prisma.scheduleAttendance.findUnique({
              where: {
                scheduleId_userId: {
                  scheduleId,
                  userId: currentUserId,
                },
              },
              select: {
                userId: true,
                mvpToUserId: true,
                teamType: true,
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
        mvpReceived: true,
        mvpToUserId: true,
        userId: true,
        user: {
          select: {
            id: true,
            nickname: true,
            name: manageableTeams.length > 0 ? true : false,
            image: true,
          },
        },
      },
    });

    // 현재 사용자가 참석자에 포함되어 있는지 확인
    const isCurrentUserAttending = currentUserId
      ? attendances.some((att) => att.userId === currentUserId)
      : false;

    // MVP 통계 계산
    const calculateMvpStats = (
      teamAttendances: typeof attendances
    ): MvpStats => {
      const voted = teamAttendances.filter(
        (att) => att.mvpToUserId !== null
      ).length;
      const total = teamAttendances.length;
      const voteRate = total > 0 ? Math.round((voted / total) * 100) : 0;

      return {
        voted,
        notVoted: total - voted,
        voteRate,
      };
    };

    const hostAttendances = attendances.filter(
      (att) => att.teamType === "HOST"
    );
    const invitedAttendances = attendances.filter(
      (att) => att.teamType === "INVITED"
    );

    return {
      success: true,
      data: {
        hostTeam,
        invitedTeam,
        attendances,
        manageableTeams,
        schedule,
        currentUserAttendance,
        isCurrentUserAttending,
        mvpStats: {
          host: calculateMvpStats(hostAttendances),
          invited: calculateMvpStats(invitedAttendances),
        },
      },
    };
  } catch (error) {
    console.error("MVP 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
