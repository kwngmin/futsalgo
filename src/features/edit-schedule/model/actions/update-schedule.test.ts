"use server";

import { prisma } from "@/shared/lib/prisma";
import { EditFormData } from "../../../../app/(no-layout)/schedule/[id]/edit/ui/EditScheduleForm";
import { revalidatePath } from "next/cache";

export type UpdateScheduleReturn =
  | {
      success: true;
      data: { id: string };
    }
  | {
      success: false;
      error: string;
    };

export async function updateSchedule(
  scheduleId: string,
  formData: EditFormData
): Promise<UpdateScheduleReturn> {
  try {
    // 기존 일정 조회
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        id: true,
        matchType: true,
        date: true,
        startTime: true,
        endTime: true,
        createdById: true,
        hostTeamId: true,
        invitedTeamId: true,
        status: true,
      },
    });

    if (!existingSchedule) {
      return {
        success: false,
        error: "일정을 찾을 수 없습니다",
      };
    }

    // 권한 체크 (생성자만 수정 가능)
    // TODO: 추후 팀장/부팀장 권한도 추가할 수 있음
    // if (existingSchedule.createdById !== userId) {
    //   return {
    //     success: false,
    //     error: "일정을 수정할 권한이 없습니다",
    //   };
    // }

    // 날짜/시간 파싱
    const matchDate = new Date(formData.date);
    const [startHour, startMinute] = formData.startTime.split(":").map(Number);
    const [endHour, endMinute] = formData.endTime.split(":").map(Number);

    const startTime = new Date(matchDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(matchDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    let attendanceDeadline: Date | undefined;
    if (formData.enableAttendanceVote && formData.attendanceDeadline) {
      attendanceDeadline = new Date(formData.attendanceDeadline);
      attendanceDeadline.setHours(23, 59, 59, 999); // 자정 마감
    }

    // 변경사항 감지
    const wasTeamMatch = existingSchedule.matchType === "TEAM";
    const willBeTeamMatch = formData.matchType === "TEAM";
    const isDateChanged =
      existingSchedule.date.toISOString().split("T")[0] !== formData.date;
    const isTimeChanged =
      existingSchedule.startTime.toTimeString().slice(0, 5) !==
        formData.startTime ||
      existingSchedule.endTime.toTimeString().slice(0, 5) !== formData.endTime;

    // 친선전에서 자체전으로 변경하거나 친선전에서 날짜/시간 변경 시 삭제 후 재생성
    if (
      (wasTeamMatch && !willBeTeamMatch) ||
      (wasTeamMatch && (isDateChanged || isTimeChanged))
    ) {
      return await recreateSchedule(
        scheduleId,
        formData,
        existingSchedule.createdById
      );
    }

    // 일반적인 수정
    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        place: formData.place,
        description: formData.description || null,
        date: matchDate,
        startTime,
        endTime,
        matchType: formData.matchType as "SQUAD" | "TEAM",
        city: formData.city || null,
        district: formData.district || null,
        enableAttendanceVote: formData.enableAttendanceVote,
        attendanceDeadline,
        hostTeamId: formData.hostTeamId,
        invitedTeamId: formData.invitedTeamId || null,
        year: matchDate.getFullYear(),
      },
    });

    revalidatePath("/schedule");
    revalidatePath(`/schedule/${scheduleId}`);

    return {
      success: true,
      data: { id: updatedSchedule.id },
    };
  } catch (error) {
    console.error("일정 수정 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}

// 기존 일정 삭제 후 새로운 일정 생성
async function recreateSchedule(
  oldScheduleId: string,
  formData: EditFormData,
  createdById: string
): Promise<UpdateScheduleReturn> {
  try {
    return await prisma.$transaction(async (tx) => {
      // 기존 일정을 DELETED 상태로 변경
      await tx.schedule.update({
        where: { id: oldScheduleId },
        data: {
          status: "DELETED",
        },
      });

      // 새로운 일정 생성
      const matchDate = new Date(formData.date);
      const [startHour, startMinute] = formData.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = formData.endTime.split(":").map(Number);

      const startTime = new Date(matchDate);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(matchDate);
      endTime.setHours(endHour, endMinute, 0, 0);

      let attendanceDeadline: Date | undefined;
      if (formData.enableAttendanceVote && formData.attendanceDeadline) {
        attendanceDeadline = new Date(formData.attendanceDeadline);
        attendanceDeadline.setHours(23, 59, 59, 999);
      }

      const newSchedule = await tx.schedule.create({
        data: {
          place: formData.place,
          description: formData.description || null,
          date: matchDate,
          startTime,
          endTime,
          matchType: formData.matchType as "SQUAD" | "TEAM",
          city: formData.city || null,
          district: formData.district || null,
          enableAttendanceVote: formData.enableAttendanceVote,
          attendanceDeadline,
          hostTeamId: formData.hostTeamId,
          invitedTeamId: formData.invitedTeamId || null,
          createdById,
          year: matchDate.getFullYear(),
          status: formData.matchType === "TEAM" ? "PENDING" : "READY",
        },
      });

      // 친선전인 경우 초대 생성
      if (formData.matchType === "TEAM" && formData.invitedTeamId) {
        await tx.teamMatchInvitation.create({
          data: {
            scheduleId: newSchedule.id,
            invitedTeamId: formData.invitedTeamId,
            status: "PENDING",
          },
        });
      }

      revalidatePath("/schedule");
      revalidatePath(`/schedule/${oldScheduleId}`);

      return {
        success: true,
        data: { id: newSchedule.id },
      };
    });
  } catch (error) {
    console.error("일정 재생성 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}
