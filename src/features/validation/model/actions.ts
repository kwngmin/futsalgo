"use server";

import { prisma } from "@/shared/lib/prisma";
import { ValidationField } from "./types";

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

/**
 * 필드별 검증 server action
 * @param field 검증할 필드 타입
 * @param value 검증할 값
 * @param setField 상태 업데이트 함수
 */
export async function validateField(
  field: "phone" | "nickname" | "email" | "teamCode",
  value: string,
  setField: React.Dispatch<React.SetStateAction<ValidationField>>
) {
  try {
    setField((prev) => ({
      ...prev,
      status: "checking",
    }));

    let result;

    switch (field) {
      case "phone":
        result = await checkPhoneAvailability(value);
        break;
      case "nickname":
        result = await checkNicknameAvailability(value);
        break;
      case "email":
        result = await checkEmailAvailability(value);
        break;
      case "teamCode":
        result = await checkTeamCodeAvailability(value);
        break;
      default:
        throw new Error(`Unknown field type: ${field}`);
    }

    if (result.success) {
      if (result.isDuplicate) {
        setField((prev) => ({
          ...prev,
          status: "invalid",
          error: result.message,
        }));
      } else {
        setField((prev) => ({
          ...prev,
          status: "valid",
          error: undefined,
        }));
      }
    } else {
      setField((prev) => ({
        ...prev,
        status: "invalid",
        error: result.error || "검증 중 오류가 발생했습니다.",
      }));
    }
  } catch (error) {
    console.error(`${field} validation error:`, error);
    setField((prev) => ({
      ...prev,
      status: "invalid",
      error: "검증 중 오류가 발생했습니다.",
    }));
  }
}

/**
 * 전화번호 중복 검증 server action
 */
async function checkPhoneAvailability(phone: string) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { phone },
      select: { id: true },
    });

    return {
      success: true,
      isDuplicate: !!existingUser,
      message: existingUser
        ? "이미 사용 중인 전화번호입니다."
        : "사용 가능한 전화번호입니다.",
    };
  } catch (error) {
    console.error("Phone validation error:", error);
    return {
      success: false,
      error: "전화번호 검증 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 닉네임 중복 검증 server action
 */
async function checkNicknameAvailability(nickname: string) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { nickname },
      select: { id: true },
    });

    return {
      success: true,
      isDuplicate: !!existingUser,
      message: existingUser
        ? "이미 사용 중인 닉네임입니다."
        : "사용 가능한 닉네임입니다.",
    };
  } catch (error) {
    console.error("Nickname validation error:", error);
    return {
      success: false,
      error: "닉네임 검증 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 이메일 중복 검증 server action
 */
async function checkEmailAvailability(email: string) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });

    return {
      success: true,
      isDuplicate: !!existingUser,
      message: existingUser
        ? "이미 사용 중인 이메일입니다."
        : "사용 가능한 이메일입니다.",
    };
  } catch (error) {
    console.error("Email validation error:", error);
    return {
      success: false,
      error: "이메일 검증 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 팀 코드 중복 검증 server action
 */
async function checkTeamCodeAvailability(teamCode: string) {
  try {
    const existingTeam = await prisma.team.findFirst({
      where: { code: teamCode },
      select: { id: true },
    });

    return {
      success: true,
      isDuplicate: !!existingTeam,
      message: existingTeam
        ? "이미 사용 중인 팀 코드입니다."
        : "사용 가능한 팀 코드입니다.",
    };
  } catch (error) {
    console.error("Team code validation error:", error);
    return {
      success: false,
      error: "팀 코드 검증 중 오류가 발생했습니다.",
    };
  }
}
