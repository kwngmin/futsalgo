"use client";

import { SetStateAction, Dispatch } from "react";
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
import { useRouter } from "next/navigation";
import { updatePhone } from "@/app/(no-layout)/profile/model/actions";
import { usePhoneValidation } from "@/features/validation/hooks/use-validation";

export function OnboardingPhone({
  setCurrentStep,
  initialStep,
}: {
  setCurrentStep: Dispatch<SetStateAction<ValidationStep>>;
  initialStep: ValidationStep;
}) {
  const router = useRouter();
  const { phone, onChange } = usePhoneValidation();

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
        <div className="space-y-3">
          <Label htmlFor="phone">전화번호</Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              value={phone.value}
              onChange={(e) => onChange(e.target.value)}
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
