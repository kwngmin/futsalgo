"use client";

import { SetStateAction, Dispatch } from "react";
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
import { updatePhone } from "@/app/(no-layout)/more/profile/model/actions";
import { usePhoneValidation } from "@/features/validation/hooks/use-validation";
import { signOut, useSession } from "next-auth/react";
import { updateOnboardingStep } from "../model/actions/onboarding-actions";
import { OnboardingStep } from "@prisma/client";

export function OnboardingPhone({
  setCurrentStep,
}: {
  setCurrentStep: Dispatch<SetStateAction<OnboardingStep>>;
}) {
  // const router = useRouter();
  const { data: session, update } = useSession();
  const { phone, onChange } = usePhoneValidation();

  // 단계별 진행
  const handleNextStep = async () => {
    if (phone.status === "valid") {
      try {
        await updatePhone(phone.value);
        await updateOnboardingStep(OnboardingStep.NICKNAME);
        await update({
          user: { ...session?.user, onboardingStep: OnboardingStep.NICKNAME },
        });
        setCurrentStep(OnboardingStep.NICKNAME);
      } catch (error) {
        console.error("전화번호 업데이트 실패:", error);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <button
        onClick={() => signOut()}
        type="button"
        className="absolute top-4 right-4 opacity-0 hover:opacity-100 cursor-pointer transition-opacity duration-200"
      >
        <X className="size-5 text-gray-500" />
      </button>
      <CardHeader>
        <CardTitle>전화번호</CardTitle>
        <CardDescription>
          팀원들과의 연락을 위한 전화번호를 입력해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* <Label htmlFor="phone">전화번호</Label> */}
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              value={phone.value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="'-' 없이 입력해주세요 (ex. 01012345678)"
            />
            {phone.status === "checking" && (
              <Loader2 className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 animate-spin" />
            )}
            {phone.status === "valid" && (
              <Check className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 text-green-600" />
            )}
            {phone.status === "invalid" && (
              <X className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 text-red-600" />
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
          {/* <Button variant="outline" className="flex-1">
            로그아웃
          </Button> */}
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
