"use client";

import { useState, useEffect, SetStateAction, Dispatch } from "react";
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
import { validateField } from "./OnboardingFlow";
import { ValidationStep } from "../model/types";
import { useRouter } from "next/navigation";
import { ValidationField } from "@/app/(no-layout)/profile/model/types";
import { updatePhone } from "@/app/(no-layout)/profile/model/actions";

export function OnboardingPhone({
  setCurrentStep,
  initialStep,
}: {
  setCurrentStep: Dispatch<SetStateAction<ValidationStep>>;
  initialStep: ValidationStep;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState<ValidationField>({
    value: "",
    status: "idle",
  });

  const debouncedPhone = useDebounce(phone.value, 450);

  // 전화번호 실시간 검증
  useEffect(() => {
    if (debouncedPhone) {
      const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
      if (debouncedPhone.length > 9) {
        if (phoneRegex.test(debouncedPhone)) {
          validateField("phone", debouncedPhone, setPhone);
        } else {
          setPhone((prev) => ({
            ...prev,
            status: "invalid",
            error: "올바른 전화번호 형식이 아닙니다",
          }));
        }
      }
    } else {
      setPhone({
        value: "",
        status: "idle",
      });
    }
  }, [debouncedPhone]);

  // 단계별 진행
  const handleNextStep = async () => {
    if (phone.status === "valid") {
      try {
        await updatePhone(phone.value);
        setCurrentStep("nickname");
      } catch (error) {
        console.error("전화번호 업데이트 실패:", error);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>전화번호 입력</CardTitle>
        <CardDescription>
          팀원들과의 연락을 위한 전화번호를 입력해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">전화번호</Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              value={phone.value}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, ""); // 숫자만 추출
                setPhone((prev) => ({
                  ...prev,
                  value: onlyNumbers,
                  status: "idle",
                }));
              }}
              placeholder="'-' 없이 입력해주세요 (ex. 01012345678)"
            />
            {phone.status === "checking" && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
            )}
            {phone.status === "valid" && (
              <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
            )}
            {phone.status === "invalid" && (
              <X className="absolute right-3 top-2.5 h-4 w-4 text-red-600" />
            )}
          </div>
          {phone.error && (
            <Alert
              variant="destructive"
              className="bg-destructive/5 border-none"
            >
              <AlertDescription>{phone.error}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex gap-3">
          {initialStep === "phone" ? (
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex-1"
            >
              나중에 하기
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setCurrentStep("email")}
              className="flex-1"
            >
              이전
            </Button>
          )}
          <Button
            onClick={handleNextStep}
            disabled={phone.status !== "valid"}
            className="flex-1"
          >
            다음
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
