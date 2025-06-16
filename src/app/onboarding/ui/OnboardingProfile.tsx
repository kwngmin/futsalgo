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
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ValidationStep } from "../model/types";
import { PlayerBackground, Position, SkillLevel } from "@prisma/client";
import { updateProfileData } from "@/app/(no-layout)/profile/model/actions";
import {
  FOOT_OPTIONS,
  GENDER_OPTIONS,
  PLAYER_BACKGROUND_OPTIONS,
  POSITION_OPTIONS,
  SKILL_LEVEL_OPTIONS,
} from "@/entities/user/model/constants";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import { validateBirthDate } from "@/features/validation/model/actions";

// 유효성 검증 스키마 (중복확인 필드 제외)
const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  foot: z.enum(["LEFT", "RIGHT", "BOTH"], {
    error: () => "주발을 선택해주세요",
  }),
  gender: z.enum(["MALE", "FEMALE"], {
    error: () => "성별을 선택해주세요",
  }),
  position: z.enum(["PIVO", "ALA", "FIXO", "GOLEIRO"], {
    error: () => "포지션을 선택해주세요",
  }),
  height: z
    .number({ error: () => "신장을 입력해주세요" })
    .min(100, "키는 100cm 이상이어야 합니다")
    .max(250, "키는 250cm 이하여야 합니다"),
  birthDate: z
    .string({ error: () => "생년월일을 입력해주세요" })
    .length(8, "생년월일은 8자리여야 합니다")
    .refine(validateBirthDate, "올바른 생년월일을 입력해주세요 (예: 19850101)"),
  playerBackground: z.enum(["NON_PROFESSIONAL", "PROFESSIONAL"], {
    error: () => "선수 출신 여부를 선택해주세요",
  }),
  skillLevel: z.enum(["BEGINNER", "AMATEUR", "ACE", "SEMIPRO"], {
    error: () => "실력 수준을 선택해주세요",
  }),
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
    },
  });

  // 최종 제출
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await updateProfileData({
        profile: {
          ...data,
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="px-4">
        <CardTitle>프로필 정보 입력</CardTitle>
        <CardDescription>
          축구 활동을 위한 기본 정보를 입력해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 이름 */}
          <div className="space-y-3">
            <Label htmlFor="name" className="px-1">
              이름
            </Label>
            <Input
              {...register("name")}
              id="name"
              placeholder="이름을 입력하세요"
            />
            {errors.name && (
              <Alert variant="destructive">
                <AlertDescription>{errors.name.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 주발 */}
          <div className="space-y-3">
            <Label className="px-1">주로 사용하는 발</Label>
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
          <div className="space-y-3">
            <Label className="px-1">성별</Label>
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
          <div className="space-y-3">
            <Label className="px-1">선호하는 포지션</Label>
            <CustomRadioGroup
              options={POSITION_OPTIONS}
              value={watch("position")}
              onValueChange={(value) => setValue("position", value as Position)}
              error={errors.position?.message}
              direction="vertical"
            />
          </div>

          {/* 신장 */}
          <div className="space-y-3">
            <Label htmlFor="height" className="px-1">
              키
            </Label>
            <div className="relative">
              <Input
                {...register("height", { valueAsNumber: true })}
                id="height"
                type="number"
                min="100"
                max="250"
                placeholder="175"
                className="pr-10 text-right text-base"
              />
              <span className="leading-none text-sm text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 select-none">
                cm
              </span>
            </div>
            {errors.height && (
              <Alert variant="destructive">
                <AlertDescription>{errors.height.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 생년월일 */}
          <div className="space-y-3">
            <Label htmlFor="birthDate" className="px-1">
              생년월일 8자리
            </Label>
            <Input
              {...register("birthDate")} // valueAsNumber 제거
              id="birthDate"
              type="number"
              placeholder="19850101"
              className="text-base"
              maxLength={8} // 8자리 제한
              pattern="\d{8}" // 숫자만 입력 가능
            />
            {errors.birthDate && (
              <Alert variant="destructive">
                <AlertDescription>{errors.birthDate.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* 선수 출신 여부 */}
          <div className="space-y-3">
            <Label className="px-1">출신</Label>
            <CustomRadioGroup
              options={PLAYER_BACKGROUND_OPTIONS}
              value={watch("playerBackground")}
              onValueChange={(value) =>
                setValue("playerBackground", value as PlayerBackground)
              }
              error={errors.playerBackground?.message}
            />
          </div>

          {/* 실력 수준 */}
          <div className="space-y-3">
            <Label className="px-1">실력</Label>
            <CustomRadioGroup
              options={SKILL_LEVEL_OPTIONS}
              value={watch("skillLevel")}
              onValueChange={(value) =>
                setValue("skillLevel", value as SkillLevel)
              }
              error={errors.skillLevel?.message}
              direction="vertical"
            />
          </div>

          {errors.root && (
            <Alert variant="destructive">
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
