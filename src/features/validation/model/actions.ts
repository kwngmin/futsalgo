"use server";

import { prisma } from "@/shared/lib/prisma";

/**
 * 생년월일 유효성 검증 함수
 * @param birthDate 8자리 생년월일 문자열 (예: "19850101")
 * @returns 유효한 생년월일인지 여부
 */
export function validateBirthDate(birthDate: string): boolean {
  // 8자리 숫자인지 확인
  if (!/^\d{8}$/.test(birthDate)) {
    return false;
  }

  const year = parseInt(birthDate.substring(0, 4));
  const month = parseInt(birthDate.substring(4, 6));
  const day = parseInt(birthDate.substring(6, 8));

  // 년도 범위 확인 (1900년 ~ 현재년도)
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return false;
  }

  // 월 범위 확인
  if (month < 1 || month > 12) {
    return false;
  }

  // 일 범위 확인
  if (day < 1 || day > 31) {
    return false;
  }

  // 실제 날짜 유효성 확인
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

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
