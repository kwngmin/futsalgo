"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
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
import { useDebounce } from "@/shared/hooks/use-debounce";
import { validateField } from "../OnboardingForm";
import { ValidationStep } from "../model/type";

type ValidationStatus = "idle" | "checking" | "valid" | "invalid";

interface ValidationField {
  value: string;
  status: ValidationStatus;
  error?: string;
}

export function OnboardingNickname({
  setCurrentStep,
}: {
  setCurrentStep: Dispatch<SetStateAction<ValidationStep>>;
}) {
  const [nickname, setNickname] = useState<ValidationField>({
    value: "",
    status: "idle",
  });

  const debouncedNickname = useDebounce(nickname.value, 600);

  useEffect(() => {
    const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
    if (debouncedNickname) {
      if (
        debouncedNickname.length >= 2 &&
        debouncedNickname.length <= 20 &&
        nicknameRegex.test(debouncedNickname)
      ) {
        validateField("nickname", debouncedNickname, setNickname);
      } else {
        setNickname((prev) => ({
          ...prev,
          status: "invalid",
          error: "닉네임은 2-20자의 한글, 영문, 숫자만 가능합니다",
        }));
      }
    } else {
      setNickname({
        value: "",
        status: "idle",
      });
    }
  }, [debouncedNickname]);

  // 단계별 진행
  const handleNextStep = () => {
    if (nickname.status === "valid") {
      setCurrentStep("profile");
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
        <div className="space-y-2">
          <Label htmlFor="nickname">닉네임</Label>
          <div className="relative">
            <Input
              id="nickname"
              type="text"
              value={nickname.value}
              onChange={(e) => {
                const valueWithoutSpaces = e.target.value.replace(/\s/g, ""); // 모든 공백 제거
                setNickname((prev) => ({
                  ...prev,
                  value: valueWithoutSpaces,
                  status: "idle",
                }));
              }}
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
