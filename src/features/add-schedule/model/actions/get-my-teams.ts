"use server";

import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@prisma/client";

// 팀 데이터 select 구조 정의
const teamSelect = Prisma.validator<Prisma.TeamMemberFindManyArgs>()({
  select: {
    team: {
      select: {
        id: true,
        name: true,
        logoUrl: true,
        city: true,
        district: true,
      },
    },
  },
});

// 팀 데이터 응답 타입
export type TeamWithBasicInfo = Prisma.TeamMemberGetPayload<typeof teamSelect>;

// 반환 타입 정의
export type GetTeamsReturn =
  | {
      success: true;
      data: {
        teams: TeamWithBasicInfo[];
      };
    }
  | {
      success: false;
      error: string;
    };

// 실제 함수
export async function getTeams(id: string): Promise<GetTeamsReturn> {
  try {
    const teams = await prisma.teamMember.findMany({
      where: { userId: id, status: "APPROVED" },
      select: teamSelect.select,
    });

    if (!teams.length) {
      return {
        success: false,
        error: "팀을 찾을 수 없습니다",
      };
    }

    return {
      success: true,
      data: {
        teams,
      },
    };
  } catch (error) {
    console.error("팀 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
