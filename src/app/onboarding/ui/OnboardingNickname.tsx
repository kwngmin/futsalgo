"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
// import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2, Check, X } from "lucide-react";
import { updateNickname } from "@/app/(no-layout)/more/profile/model/actions";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 단계별 진행
  const handleNextStep = async () => {
    if (nickname.status === "valid" && !isLoading) {
      setIsLoading(true);
      setError(null);

      try {
        // 1. 닉네임 업데이트
        const nicknameResult = await updateNickname(nickname.value);
        if (!nicknameResult.success) {
          throw new Error(
            nicknameResult.error || "닉네임 업데이트에 실패했습니다"
          );
        }

        // 2. 온보딩 단계 업데이트
        const stepResult = await updateOnboardingStep(OnboardingStep.PROFILE);
        if (!stepResult.success) {
          throw new Error(
            stepResult.error || "온보딩 단계 업데이트에 실패했습니다"
          );
        }

        // 3. 세션 업데이트
        await update({
          user: { ...session?.user, onboardingStep: OnboardingStep.PROFILE },
        });

        // 4. UI 상태 업데이트
        setCurrentStep(OnboardingStep.PROFILE);
      } catch (error) {
        console.error("닉네임 업데이트 실패:", error);
        setError(
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다"
        );
      } finally {
        setIsLoading(false);
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
        <CardTitle>닉네임</CardTitle>
        <CardDescription>
          다른 사용자들에게 표시될 닉네임을 설정해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* <Label htmlFor="nickname">닉네임</Label> */}
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
          {error && (
            <Alert
              variant="destructive"
              className="bg-destructive/5 border-none"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex gap-3">
          {/* <Button variant="outline" className="flex-1">
            로그아웃
          </Button> */}
          <Button
            onClick={handleNextStep}
            disabled={nickname.status !== "valid" || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "다음"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
