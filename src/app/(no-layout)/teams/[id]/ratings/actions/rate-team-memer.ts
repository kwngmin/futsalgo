// lib/actions/team-rating-actions.ts
"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ratingSchema = z.object({
  teamId: z.string().min(1),
  toUserId: z.string().min(1),
  ratings: z.object({
    shooting: z.number().min(1).max(5),
    passing: z.number().min(1).max(5),
    stamina: z.number().min(1).max(5),
    physical: z.number().min(1).max(5),
    dribbling: z.number().min(1).max(5),
    defense: z.number().min(1).max(5),
  }),
});

interface RateTeamMemberParams {
  teamId: string;
  toUserId: string;
  ratings: {
    shooting: number;
    passing: number;
    stamina: number;
    physical: number;
    dribbling: number;
    defense: number;
  };
}

export async function rateTeamMember(params: RateTeamMemberParams) {
  try {
    // 세션 확인
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 입력값 검증
    const validatedData = ratingSchema.parse(params);
    const { teamId, toUserId, ratings } = validatedData;

    // 자기 자신을 평가하려는지 확인
    if (session.user.id === toUserId) {
      return { success: false, error: "자기 자신은 평가할 수 없습니다." };
    }

    // 현재 년월 계산
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 평가자가 해당 팀의 승인된 멤버인지 확인
    const raterMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
        status: "APPROVED",
      },
    });

    if (!raterMember) {
      return { success: false, error: "해당 팀의 멤버만 평가할 수 있습니다." };
    }

    // 피평가자가 해당 팀의 승인된 멤버인지 확인
    const ratedMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: toUserId,
        status: "APPROVED",
      },
    });

    if (!ratedMember) {
      return { success: false, error: "해당 팀의 멤버만 평가할 수 있습니다." };
    }

    // 평가자가 이번 달에 최소 1회 참석했는지 확인 (선택적 조건)
    // const hasAttended = await prisma.scheduleAttendance.findFirst({
    //   where: {
    //     userId: session.user.id,
    //     attendanceStatus: "ATTENDING",
    //     schedule: {
    //       hostTeamId: teamId,
    //       date: {
    //         gte: new Date(currentYear, currentMonth - 1, 1), // 이번 달 시작
    //         lt: new Date(currentYear, currentMonth, 1), // 다음 달 시작
    //       },
    //     },
    //   },
    // });

    // 참석 조건을 활성화하려면 주석 해제
    // if (!hasAttended) {
    //   return { success: false, error: '이번 달에 최소 1회 참석해야 평가할 수 있습니다.' };
    // }

    // 기존 평가가 있는지 확인하고 upsert 실행
    const existingRating = await prisma.teamMemberRating.findFirst({
      where: {
        teamId,
        fromUserId: session.user.id,
        toUserId,
        periodYear: currentYear,
        periodMonth: currentMonth,
      },
    });

    if (existingRating) {
      // 기존 평가 업데이트
      await prisma.teamMemberRating.update({
        where: { id: existingRating.id },
        data: ratings,
      });
    } else {
      // 새 평가 생성
      await prisma.teamMemberRating.create({
        data: {
          teamId,
          fromUserId: session.user.id,
          toUserId,
          periodYear: currentYear,
          periodMonth: currentMonth,
          ...ratings,
        },
      });
    }

    // 해당 페이지 캐시 무효화
    revalidatePath(`/teams/${teamId}/ratings/${session.user.id}`);

    return { success: true };
  } catch (error) {
    console.error("팀 멤버 평가 오류:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: "입력값이 올바르지 않습니다." };
    }

    return { success: false, error: "평가 저장 중 오류가 발생했습니다." };
  }
}

// 특정 팀의 평가 통계 조회
export async function getTeamRatingStats(
  teamId: string,
  year?: number,
  month?: number
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 기본값: 현재 년월
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    // 해당 팀의 멤버인지 확인
    const isMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
        status: "APPROVED",
      },
    });

    if (!isMember) {
      return { success: false, error: "해당 팀의 멤버만 조회할 수 있습니다." };
    }

    // 해당 기간의 모든 평가 조회
    const ratings = await prisma.teamMemberRating.findMany({
      where: {
        teamId,
        periodYear: targetYear,
        periodMonth: targetMonth,
      },
      include: {
        fromUser: {
          select: { id: true, name: true, nickname: true },
        },
        toUser: {
          select: { id: true, name: true, nickname: true },
        },
      },
    });

    return { success: true, data: ratings };
  } catch (error) {
    console.error("팀 평가 통계 조회 오류:", error);
    return { success: false, error: "데이터 조회 중 오류가 발생했습니다." };
  }
}
