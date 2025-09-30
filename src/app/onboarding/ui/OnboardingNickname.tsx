"use client";

import { Dispatch, SetStateAction } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2, Check, X } from "lucide-react";
import { updateNickname } from "@/app/(no-layout)/profile/model/actions";
import { useNicknameValidation } from "@/features/validation/hooks/use-validation";
import { updateOnboardingStep } from "../model/actions/onboarding-actions";
import { signOut, useSession } from "next-auth/react";
import { OnboardingStep } from "@prisma/client";

export function OnboardingNickname({
  setCurrentStep,
}: {
  setCurrentStep: Dispatch<SetStateAction<OnboardingStep>>;
}) {
  const { data: session, update } = useSession();
  const { nickname, onChange } = useNicknameValidation();

  // 단계별 진행
  const handleNextStep = async () => {
    if (nickname.status === "valid") {
      try {
        await updateNickname(nickname.value);
        await updateOnboardingStep(OnboardingStep.PROFILE);
        await update({
          user: { ...session?.user, onboardingStep: OnboardingStep.PROFILE },
        });
        setCurrentStep(OnboardingStep.PROFILE);
      } catch (error) {
        console.error("닉네임 업데이트 실패:", error);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <button
        onClick={() => signOut()}
        type="button"
        className="absolute top-4 right-4"
      >
        <X className="size-5 text-gray-500" />
      </button>
      <CardHeader>
        <CardTitle>닉네임 설정</CardTitle>
        <CardDescription>
          다른 사용자들에게 표시될 닉네임을 설정해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="nickname">닉네임</Label>
          <div className="relative">
            <Input
              id="nickname"
              type="text"
              value={nickname.value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="닉네임을 입력하세요"
            />
            {nickname.status === "checking" && (
              <Loader2 className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 animate-spin" />
            )}
            {nickname.status === "valid" && (
              <Check className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 text-green-600" />
            )}
            {nickname.status === "invalid" && (
              <X className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 text-red-600" />
            )}
          </div>
          {nickname.error && (
            <Alert
              variant="destructive"
              className="bg-destructive/5 border-none"
            >
              <AlertDescription>{nickname.error}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex gap-3">
          {/* <Button variant="outline" className="flex-1">
            로그아웃
          </Button> */}
          <Button
            onClick={handleNextStep}
            disabled={nickname.status !== "valid"}
            className="flex-1"
          >
            다음
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
