import { Dispatch, SetStateAction } from "react";
import { ValidationField } from "./types";

// 중복확인 함수
export const validateField = async (
  type: "email" | "phone" | "nickname",
  value: string,
  setFieldState: Dispatch<SetStateAction<ValidationField>>
) => {
  if (!value || value.trim() === "") return;

  setFieldState((prev) => ({ ...prev, status: "checking" }));

  try {
    const response = await fetch(`/api/check/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [type]: value }),
    });

    const data = await response.json();

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
        error: `이미 사용 중인 ${
          type === "email" ? "이메일" : type === "phone" ? "전화번호" : "닉네임"
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
