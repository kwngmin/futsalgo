"use server";

import { prisma } from "@/shared/lib/prisma";

// 팀 정보 타입
interface TeamInfo {
  id: string;
  name: string;
  code: string;
  city: string;
  district: string;
  logoUrl?: string;
  level: string;
  gender: string;
}

// 통합된 응답 타입
interface TeamValidationResult {
  success: boolean;
  isValid: boolean;
  team?: TeamInfo;
  error?: string;
}

// 팀 코드 검증 및 팀 정보 조회를 한 번에 처리
export async function validateTeamCodeAndGetInfo(
  teamCode: string
): Promise<TeamValidationResult> {
  try {
    // 입력값 검증
    if (!teamCode || typeof teamCode !== "string") {
      return {
        success: true,
        isValid: false,
        error: "팀 코드가 필요합니다",
      };
    }

    const trimmedCode = teamCode.trim();

    // 팀 코드 형식 검증 (6자리 숫자)
    if (!/^\d{6}$/.test(trimmedCode)) {
      return {
        success: true,
        isValid: false,
        error: "팀 코드는 6자리 숫자여야 합니다",
      };
    }

    // 데이터베이스에서 팀 조회
    const team = await prisma.team.findUnique({
      where: { code: trimmedCode },
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        district: true,
        logoUrl: true,
        level: true,
        gender: true,
        status: true,
      },
    });

    // 팀이 존재하지 않는 경우
    if (!team) {
      return {
        success: true,
        isValid: false,
        error: "존재하지 않는 팀 코드입니다",
      };
    }

    // 팀이 비활성화된 경우
    if (team.status !== "ACTIVE") {
      return {
        success: true,
        isValid: false,
        error: "비활성화된 팀입니다",
      };
    }

    // 성공적으로 유효한 팀 발견
    return {
      success: true,
      isValid: true,
      team: {
        id: team.id,
        name: team.name,
        code: team.code,
        city: team.city,
        district: team.district,
        logoUrl: team.logoUrl || undefined,
        level: team.level,
        gender: team.gender,
      },
    };
  } catch (error) {
    console.error("팀 코드 검증 오류:", error);
    return {
      success: false,
      isValid: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}
