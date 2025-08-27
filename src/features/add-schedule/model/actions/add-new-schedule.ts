"use server";

import { prisma } from "@/shared/lib/prisma";
import { MatchType, Schedule, TeamMemberStatus } from "@prisma/client";
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
    // 호스트 팀 존재 여부 확인
    const hostTeam = await prisma.team.findUnique({
      where: { id: formData.hostTeamId },
      include: {
        members: {
          where: {
            status: TeamMemberStatus.APPROVED,
            banned: false,
          },
          select: {
            userId: true,
          },
        },
      },
    });

    if (!hostTeam) {
      return {
        success: false,
        error: "해당 팀이 존재하지 않습니다",
      };
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 일정 생성
      const schedule = await tx.schedule.create({
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
          attendanceDeadline: formData.attendanceDeadline
            ? new Date(formData.attendanceDeadline)
            : null,
        },
      });

      // 2. 매치 타입에 따른 처리
      if (formData.matchType === "SQUAD") {
        // 자체전: 바로 호스트 팀 멤버들을 참석자로 추가
        if (hostTeam.members.length > 0) {
          await tx.scheduleAttendance.createMany({
            data: hostTeam.members.map((member) => ({
              scheduleId: schedule.id,
              userId: member.userId,
              attendanceStatus: "UNDECIDED",
              teamType: "HOST",
            })),
          });
        }
      } else if (formData.matchType === "TEAM" && formData.invitedTeamId) {
        // 친선전: 초대만 생성, 참석자 추가는 수락 후
        await tx.teamMatchInvitation.create({
          data: {
            scheduleId: schedule.id,
            invitedTeamId: formData.invitedTeamId,
            status: "PENDING",
          },
        });
      }

      return schedule;
    });

    revalidatePath("/");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("일정 추가 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}

// 별도 함수: 팀 매치 초대 수락 시 호출
export async function acceptTeamMatchInvitation({
  scheduleId,
  invitedTeamId,
}: {
  scheduleId: string;
  invitedTeamId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. 초대 상태를 수락으로 변경
      await tx.teamMatchInvitation.update({
        where: {
          scheduleId,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      // 2. 일정 상태를 READY로 변경
      await tx.schedule.update({
        where: { id: scheduleId },
        data: { status: "READY" },
      });

      // 3. 이제 양 팀 멤버들을 참석자로 추가
      const [hostTeam, invitedTeam] = await Promise.all([
        tx.team.findUnique({
          where: {
            id: (
              await tx.schedule.findUnique({
                where: { id: scheduleId },
                select: { hostTeamId: true },
              })
            )?.hostTeamId,
          },
          include: {
            members: {
              where: {
                status: TeamMemberStatus.APPROVED,
                banned: false,
              },
              select: {
                userId: true,
              },
            },
          },
        }),
        tx.team.findUnique({
          where: { id: invitedTeamId },
          include: {
            members: {
              where: {
                status: TeamMemberStatus.APPROVED,
                banned: false,
              },
              select: {
                userId: true,
              },
            },
          },
        }),
      ]);

      // 호스트 팀 멤버 추가
      if (hostTeam && hostTeam.members.length > 0) {
        await tx.scheduleAttendance.createMany({
          data: hostTeam.members.map((member) => ({
            scheduleId,
            userId: member.userId,
            attendanceStatus: "UNDECIDED",
            teamType: "HOST",
          })),
        });
      }

      // 초대받은 팀 멤버 추가
      if (invitedTeam && invitedTeam.members.length > 0) {
        await tx.scheduleAttendance.createMany({
          data: invitedTeam.members.map((member) => ({
            scheduleId,
            userId: member.userId,
            attendanceStatus: "UNDECIDED",
            teamType: "INVITED",
          })),
        });
      }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("초대 수락 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}

// 별도 함수: 팀 매치 초대 거절 시 호출
export async function rejectTeamMatchInvitation({
  scheduleId,
  reason,
}: {
  scheduleId: string;
  reason?: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await prisma.teamMatchInvitation.update({
      where: {
        scheduleId,
      },
      data: {
        status: "DECLINED",
        reason,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("초대 거절 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
