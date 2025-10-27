// app/teams/[id]/actions/delete-team.ts
"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

const DateUtils = {
    // 한국 시간 기준으로 Date 객체 가져오기
    getKoreanDate(): Date {
      const now = new Date();
      // UTC 시간에 9시간 더하기 (KST = UTC+9)
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const koreanTime = new Date(utcTime + 9 * 60 * 60 * 1000);
      return koreanTime;
    },
  
    // 날짜를 YYYY-MM-DD 형식으로 포맷팅하는 공통 함수
    formatDateString(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
  
    getTodayString(): string {
      const today = this.getKoreanDate();
      return this.formatDateString(today);
    },
  
 
  };

export async function deleteTeam(teamId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 팀장 권한 확인
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
        status: "APPROVED",
        role: "OWNER",
      },
    });

    if (!membership) {
      return { success: false, error: "팀 삭제 권한이 없습니다." };
    }

    // 진행 중인 경기 일정 확인
    const activeSchedules = await prisma.schedule.findMany({
      where: {
        OR: [{ invitedTeamId: teamId }, { hostTeamId: teamId }],
        status: {
          in: ["PENDING", "CONFIRMED", "READY", "PLAY"],
        },
        date: {
          gte: DateUtils.getTodayString(), // 현재 시간 이후의 일정만
        },
      },
      select: {
        id: true,
        date: true,
      },
    });

    if (activeSchedules.length > 0) {
      return { 
        success: false, 
        error: `진행 중이거나 예정된 일정이 ${activeSchedules.length}개 있습니다. 일정을 먼저 처리해주세요.`,
        activeSchedules, // 클라이언트에서 확인 가능하도록
      };
    }

    // 트랜잭션으로 soft delete 처리
    await prisma.$transaction(async (tx) => {
      // 1. 팀 soft delete
      await tx.team.update({
        where: { id: teamId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: session.user.id,
          status: "DISBANDED", // TeamStatus enum 활용
        },
      });

      // 2. 모든 팀원의 상태를 LEAVE로 변경
      await tx.teamMember.updateMany({
        where: {
          teamId,
          status: "APPROVED",
        },
        data: {
          status: "LEAVE",
          updatedAt: new Date(),
        },
      });

      // 3. 팀 팔로우 해제
      await tx.teamFollow.deleteMany({
        where: { teamId },
      });

      // 4. 모집 상태 변경
      await tx.team.update({
        where: { id: teamId },
        data: {
          recruitmentStatus: "NOT_RECRUITING",
        },
      });
    });

    revalidatePath("/teams");
    revalidatePath(`/teams/${teamId}`);

    return { 
      success: true, 
      message: "팀이 성공적으로 삭제되었습니다." 
    };
  } catch (error) {
    console.error("팀 삭제 오류:", error);
    return { 
      success: false, 
      error: "팀 삭제 중 오류가 발생했습니다." 
    };
  }
}

// 팀 복구 함수 (필요시 사용)
export async function restoreTeam(teamId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 관리자 권한 확인 또는 특정 조건 확인
    // ...

    await prisma.team.update({
      where: { id: teamId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        status: "ACTIVE",
      },
    });

    revalidatePath("/teams");
    revalidatePath(`/teams/${teamId}`);

    return { success: true, message: "팀이 복구되었습니다." };
  } catch (error) {
    console.error("팀 복구 오류:", error);
    return { success: false, error: "팀 복구 중 오류가 발생했습니다." };
  }
}