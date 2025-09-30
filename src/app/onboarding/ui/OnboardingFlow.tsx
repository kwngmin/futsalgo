"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import OnboardingComplete from "./OnboardingComplete";
import { OnboardingEmail } from "./OnboardingEmail";
import { OnboardingPhone } from "./OnboardingPhone";
import { OnboardingNickname } from "./OnboardingNickname";
import { OnboardingProfile } from "./OnboardingProfile";
import { OnboardingStep } from "@prisma/client";

export function OnboardingFlow() {
  const { data: session } = useSession();
  console.log(session, "session");
  const initialStep = session?.user?.onboardingStep || OnboardingStep.EMAIL;
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);

  // 완료 화면
  if (currentStep === OnboardingStep.COMPLETE) return <OnboardingComplete />;

  // 이메일 확인 단계
  if (currentStep === OnboardingStep.EMAIL)
    return <OnboardingEmail setCurrentStep={setCurrentStep} />;

  // 전화번호 확인 단계
  if (currentStep === OnboardingStep.PHONE)
    return <OnboardingPhone setCurrentStep={setCurrentStep} />;

  // 닉네임 확인 단계
  if (currentStep === OnboardingStep.NICKNAME)
    return <OnboardingNickname setCurrentStep={setCurrentStep} />;

  // 프로필 정보 입력 단계
  return (
    <OnboardingProfile
      setCurrentStep={setCurrentStep}
      // name={session?.user?.name ?? undefined}
    />
  );
}
