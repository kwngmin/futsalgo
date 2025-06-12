"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { useSession } from "next-auth/react";
import OnboardingComplete from "./OnboardingComplete";
import { OnboardingEmail } from "./OnboardingEmail";
import { OnboardingPhone } from "./OnboardingPhone";
import { OnboardingNickname } from "./OnboardingNickname";
import { OnboardingProfile } from "./OnboardingProfile";
import { ValidationField, ValidationStep } from "../model/type";

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

export function OnboardingFlow() {
  const { data: session } = useSession();
  const initialStep = session?.user?.email ? "phone" : "email";
  const [currentStep, setCurrentStep] = useState<ValidationStep>(initialStep);

  // 완료 화면
  if (currentStep === "complete") return <OnboardingComplete />;

  // 이메일 확인 단계
  if (currentStep === "email")
    return <OnboardingEmail setCurrentStep={setCurrentStep} />;

  // 전화번호 확인 단계
  if (currentStep === "phone")
    return (
      <OnboardingPhone
        setCurrentStep={setCurrentStep}
        initialStep={initialStep}
      />
    );

  // 닉네임 확인 단계
  if (currentStep === "nickname")
    return <OnboardingNickname setCurrentStep={setCurrentStep} />;

  // 프로필 정보 입력 단계
  return (
    <OnboardingProfile
      setCurrentStep={setCurrentStep}
      name={session?.user?.name ?? undefined}
    />
  );
}
