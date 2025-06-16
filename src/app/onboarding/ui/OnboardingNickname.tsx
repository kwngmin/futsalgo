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
import { ValidationStep } from "../model/types";
import { updateNickname } from "@/app/(no-layout)/profile/model/actions";
import { useNicknameValidation } from "@/features/validation/hooks/use-validation";

export function OnboardingNickname({
  setCurrentStep,
}: {
  setCurrentStep: Dispatch<SetStateAction<ValidationStep>>;
}) {
  const { nickname, onChange } = useNicknameValidation();

  // 단계별 진행
  const handleNextStep = async () => {
    if (nickname.status === "valid") {
      try {
        await updateNickname(nickname.value);
        setCurrentStep("profile");
      } catch (error) {
        console.error("닉네임 업데이트 실패:", error);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
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
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
            )}
            {nickname.status === "valid" && (
              <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
            )}
            {nickname.status === "invalid" && (
              <X className="absolute right-3 top-2.5 h-4 w-4 text-red-600" />
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
          <Button
            variant="outline"
            onClick={() => setCurrentStep("phone")}
            className="flex-1"
          >
            이전
          </Button>
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
