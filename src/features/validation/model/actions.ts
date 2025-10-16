"use server";

import { prisma } from "@/shared/lib/prisma";

/**
 * 팀 이름 중복 검증 server action
 * @param name 검증할 팀 이름
 * @param teamId 수정 시 현재 팀 ID (선택사항)
 * @returns 중복 여부를 포함한 결과
 */
export async function checkTeamNameAvailability({
  name,
  teamId,
}: {
  name: string;
  teamId?: string;
}) {
  try {
    if (!name || typeof name !== "string") {
      return {
        success: false,
        error: "팀 이름이 필요합니다.",
      };
    }

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return {
        success: false,
        error: "팀 이름을 입력해주세요.",
      };
    }

    // 기존 팀 이름과 중복 검사 (수정 시에는 현재 팀 제외)
    const whereClause: {
      name: string;
      id?: { not: string };
    } = {
      name: trimmedName,
    };

    if (teamId) {
      whereClause.id = {
        not: teamId,
      };
    }

    const existingTeam = await prisma.team.findFirst({
      where: whereClause,
      select: {
        id: true,
      },
    });

    return {
      success: true,
      isDuplicate: !!existingTeam,
      message: existingTeam
        ? "이미 사용 중인 팀 이름입니다."
        : "사용 가능한 팀 이름입니다.",
    };
  } catch (error) {
    console.error("팀 이름 중복 검증 오류:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다.",
    };
  }
}
