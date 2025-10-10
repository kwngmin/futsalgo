import { Dispatch, SetStateAction } from "react";
import { ValidationField } from "./types";
import { createApiRequestOptions, safeJsonParse } from "@/shared/lib/api-utils";

// 중복확인 함수
export const validateField = async (
  type: "email" | "phone" | "nickname" | "teamCode",
  value: string,
  setFieldState: Dispatch<SetStateAction<ValidationField>>
) => {
  if (!value || value.trim() === "") return;

  setFieldState((prev) => ({ ...prev, status: "checking" }));

  try {
    const response = await fetch(
      `/api/check/${type}`,
      createApiRequestOptions("POST", { [type]: value })
    );

    const data = await safeJsonParse(response);

    if (data.available) {
      setFieldState((prev) => ({
        ...prev,
        status: "valid",
        error: undefined,
      }));
    } else {
      setFieldState((prev) => ({
        ...prev,
        status: "invalid",
        error:
          type === "teamCode"
            ? `존재하지 않는 팀 코드입니다`
            : `이미 사용 중인 ${
                type === "email"
                  ? "이메일"
                  : type === "phone"
                  ? "전화번호"
                  : "닉네임"
              }입니다`,
      }));
    }
  } catch (error) {
    console.error(`${type} validation error:`, error);
    setFieldState((prev) => ({
      ...prev,
      status: "invalid",
      error: "확인 중 오류가 발생했습니다",
    }));
  }
};

// 생년월일 검증 함수
export const validateBirthDate = (birthDate: string): boolean => {
  // 8자리 숫자인지 확인
  if (!/^\d{8}$/.test(birthDate)) return false;

  // 유효한 날짜인지 확인
  const year = parseInt(birthDate.substring(0, 4));
  const month = parseInt(birthDate.substring(4, 6));
  const day = parseInt(birthDate.substring(6, 8));

  // 기본 범위 체크
  if (year < 1900 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // 실제 날짜 유효성 체크
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};
