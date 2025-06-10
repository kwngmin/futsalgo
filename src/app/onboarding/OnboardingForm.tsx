"use client";

import { useState, Dispatch, SetStateAction } from "react";
// import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import OnboardingComplete from "./ui/Complete";
import { OnboardingEmail } from "./ui/Email";
import { OnboardingPhone } from "./ui/Phone";
import { OnboardingNickname } from "./ui/Nickname";
import { OnboardingProfile } from "./ui/Profile";
import { ValidationField, ValidationStep } from "./model/type";

// 중복확인 함수
export const validateField = async (
  type: "email" | "phone" | "nickname",
  value: string,
  setFieldState: Dispatch<SetStateAction<ValidationField>>
) => {
  if (!value || value.trim() === "") return;

  setFieldState((prev) => ({ ...prev, status: "checking" }));
  console.log(value, "value");
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

export function OnboardingForm() {
  // const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<ValidationStep>(
    session?.user?.email ? "phone" : "email"
  );

  // // 세션 데이터로 이메일 초기값 설정
  // useEffect(() => {
  //   if (session?.user?.email) {
  //     setEmail((prev) => ({ ...prev, value: session.user.email! }));
  //   }
  //   if (session?.user?.name) {
  //     setValue("name", session.user.name);
  //   }
  // }, [session, setValue]);

  // 완료 화면
  if (currentStep === "complete") return <OnboardingComplete />;

  // 이메일 확인 단계
  if (currentStep === "email")
    return <OnboardingEmail setCurrentStep={setCurrentStep} />;

  // 전화번호 확인 단계
  if (currentStep === "phone")
    return <OnboardingPhone setCurrentStep={setCurrentStep} />;

  // 닉네임 확인 단계
  if (currentStep === "nickname")
    return <OnboardingNickname setCurrentStep={setCurrentStep} />;

  // 프로필 정보 입력 단계
  return <OnboardingProfile setCurrentStep={setCurrentStep} />;
}
