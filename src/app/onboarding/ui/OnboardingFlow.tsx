"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import OnboardingComplete from "./OnboardingComplete";
import { OnboardingEmail } from "./OnboardingEmail";
import { OnboardingPhone } from "./OnboardingPhone";
import { OnboardingNickname } from "./OnboardingNickname";
import { OnboardingProfile } from "./OnboardingProfile";
import { ValidationStep } from "../model/types";

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
      // name={session?.user?.name ?? undefined}
    />
  );
}
