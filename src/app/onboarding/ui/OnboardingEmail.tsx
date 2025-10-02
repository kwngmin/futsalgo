"use client";

import { Dispatch, SetStateAction } from "react";
// import { useRouter } from "next/navigation";
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
import { updateEmail } from "@/app/(no-layout)/more/profile/model/actions";
import { useEmailValidation } from "@/features/validation/hooks/use-validation";
import { OnboardingStep } from "@prisma/client";
import { updateOnboardingStep } from "../model/actions/onboarding-actions";
import { signOut, useSession } from "next-auth/react";

export function OnboardingEmail({
  setCurrentStep,
}: {
  setCurrentStep: Dispatch<SetStateAction<OnboardingStep>>;
}) {
  // const router = useRouter();
  const { data: session, update } = useSession();

  const { email, onChange } = useEmailValidation();
  console.log(session, "session default");

  // 단계별 진행
  const handleNextStep = async () => {
    if (email.status === "valid") {
      try {
        await updateEmail(email.value);
        await updateOnboardingStep(OnboardingStep.PHONE);
        await update({
          user: { ...session?.user, onboardingStep: OnboardingStep.PHONE },
        });
        setCurrentStep(OnboardingStep.PHONE);
        console.log(session, "session after");
      } catch (error) {
        console.error("이메일 업데이트 실패:", error);
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
        <CardTitle>이메일 확인</CardTitle>
        <CardDescription>사용할 이메일 주소를 확인해주세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="email">이메일</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email.value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="example@email.com"
            />
            {email.status === "checking" && (
              <Loader2 className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 animate-spin" />
            )}
            {email.status === "valid" && (
              <Check className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 text-green-600" />
            )}
            {email.status === "invalid" && (
              <X className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 text-red-600" />
            )}
          </div>
          {email.error && (
            <Alert variant="destructive">
              <AlertDescription>{email.error}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex gap-3">
          {/* <Button variant="outline" className="flex-1">
            로그아웃
          </Button> */}
          <Button
            onClick={handleNextStep}
            disabled={email.status !== "valid"}
            className="flex-1"
          >
            다음
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
