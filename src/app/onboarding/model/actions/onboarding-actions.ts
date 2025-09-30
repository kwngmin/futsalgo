"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { OnboardingStep } from "@prisma/client";
import { revalidatePath } from "next/cache";

type UpdateOnboardingResult = {
  success: boolean;
  error?: string;
  data?: {
    onboardingStep: OnboardingStep;
    onboardingCompletedAt?: Date | null;
  };
};

export async function updateOnboardingStep(
  step: OnboardingStep
): Promise<UpdateOnboardingResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "인증되지 않은 사용자입니다.",
      };
    }

    const validSteps: OnboardingStep[] = [
      "EMAIL",
      "PHONE",
      "NICKNAME",
      "PROFILE",
      "PLAYER",
      "SNS",
      "COMPLETE",
    ];

    if (!validSteps.includes(step)) {
      return {
        success: false,
        error: "유효하지 않은 온보딩 단계입니다.",
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingStep: step,
        ...(step === "COMPLETE" && {
          onboardingCompletedAt: new Date(),
        }),
      },
      select: {
        onboardingStep: true,
        onboardingCompletedAt: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/onboarding");

    return {
      success: true,
      data: {
        onboardingStep: updatedUser.onboardingStep,
        onboardingCompletedAt: updatedUser.onboardingCompletedAt,
      },
    };
  } catch (error) {
    console.error("온보딩 업데이트 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다.",
    };
  }
}

export async function completeOnboarding(): Promise<UpdateOnboardingResult> {
  return updateOnboardingStep("COMPLETE");
}
