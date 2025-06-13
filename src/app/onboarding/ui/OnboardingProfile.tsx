"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
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
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ValidationStep } from "../model/types";
import { Position } from "@prisma/client";
import { updateProfileData } from "@/app/(no-layout)/profile/model/actions";
import {
  FOOT_OPTIONS,
  GENDER_OPTIONS,
  POSITION_OPTIONS,
} from "@/entities/user/model/constants";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";

// 유효성 검증 스키마 (중복확인 필드 제외)
const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  foot: z.enum(["LEFT", "RIGHT", "BOTH"], {
    error: () => "주발을 선택해주세요",
  }),
  gender: z.enum(["MALE", "FEMALE"], {
    error: () => "성별을 선택해주세요",
  }),
  positions: z
    .array(z.string())
    .min(1, "최소 1개의 포지션을 선택해주세요")
    .max(5, "최대 5개의 포지션까지 선택 가능합니다"),
  height: z
    .number({ error: () => "신장을 입력해주세요" })
    .min(100, "키는 100cm 이상이어야 합니다")
    .max(250, "키는 250cm 이하여야 합니다"),
  birthYear: z
    .number()
    .min(1950, "출생년도는 1950년 이후여야 합니다")
    .max(new Date().getFullYear(), "출생년도는 현재 년도 이하여야 합니다"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function OnboardingProfile({
  setCurrentStep,
  name,
}: {
  setCurrentStep: Dispatch<SetStateAction<ValidationStep>>;
  name?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name,
      positions: [],
    },
  });

  const selectedPositions = watch("positions");

  // 포지션 토글
  const togglePosition = (position: string) => {
    const current = selectedPositions || [];
    let updated;

    if (current.includes(position)) {
      updated = current.filter((p) => p !== position);
    } else if (current.length < 5) {
      updated = [...current, position];
    } else {
      return; // 최대 5개 제한
    }

    setValue("positions", updated);
  };

  // 최종 제출
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await updateProfileData({
        profile: {
          ...data,
          positions: data.positions as Position[],
        },
      });

      if (response.success) {
        setCurrentStep("complete");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 2000);
      } else {
        throw new Error(response.error || "온보딩 실패");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      setError("root", {
        message: "처리 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>프로필 정보 입력</CardTitle>
        <CardDescription>
          축구 활동을 위한 기본 정보를 입력해주세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 이름 */}
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="font-semibold text-base text-muted-foreground"
            >
              이름
            </Label>
            <Input
              {...register("name")}
              id="name"
              placeholder="이름을 입력하세요"
            />
            {errors.name && (
              <Alert>
                <AlertDescription>{errors.name.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 주발 */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-base text-muted-foreground">
              주로 사용하는 발
            </Label>
            <CustomRadioGroup
              options={FOOT_OPTIONS}
              value={watch("foot")}
              onValueChange={(value) =>
                setValue("foot", value as "LEFT" | "RIGHT" | "BOTH")
              }
              error={errors.foot?.message}
            />
          </div>

          {/* 성별 */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-base text-muted-foreground">
              성별
            </Label>
            <CustomRadioGroup
              options={GENDER_OPTIONS}
              value={watch("gender")}
              onValueChange={(value) =>
                setValue("gender", value as "MALE" | "FEMALE")
              }
              error={errors.gender?.message}
            />
          </div>

          {/* 포지션 */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-base text-muted-foreground">
              선호하는 포지션 • {selectedPositions?.length || 0}/5
            </Label>
            <div className="flex flex-wrap gap-2">
              {POSITION_OPTIONS.map((position) => (
                <Badge
                  key={position.value}
                  variant={
                    selectedPositions?.includes(position.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer text-center justify-center items-center h-9 px-3 rounded-full"
                  onClick={() => togglePosition(position.value)}
                >
                  {`${position.value} - ${position.label}`}
                </Badge>
              ))}
            </div>
            {errors.positions && (
              <Alert>
                <AlertDescription>{errors.positions.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 신장 */}
          <div className="space-y-1.5">
            <Label
              htmlFor="height"
              className="font-semibold text-base text-muted-foreground"
            >
              키 (cm)
            </Label>
            <Input
              {...register("height", { valueAsNumber: true })}
              id="height"
              type="number"
              min="100"
              max="250"
              placeholder="175"
            />
            {errors.height && (
              <Alert>
                <AlertDescription>{errors.height.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 출생년도 (선택) */}
          <div className="space-y-1.5">
            <Label
              htmlFor="birthYear"
              className="font-semibold text-base text-muted-foreground"
            >
              출생년도
            </Label>
            <Input
              {...register("birthYear", { valueAsNumber: true })}
              id="birthYear"
              type="number"
              min="1950"
              max={new Date().getFullYear()}
              placeholder="1990"
            />
            {errors.birthYear && (
              <Alert>
                <AlertDescription>{errors.birthYear.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {errors.root && (
            <Alert>
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep("nickname")}
              className="flex-1"
            >
              이전
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "완료"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
