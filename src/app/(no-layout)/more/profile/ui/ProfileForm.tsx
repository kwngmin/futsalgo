import { Label } from "@/shared/components/ui/label";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import {
  Condition,
  Position,
  PlayerBackground,
  User,
  PlayerSkillLevel,
} from "@prisma/client";
import { Button } from "@/shared/components/ui/button";
import {
  CONDITION_OPTIONS,
  FOOT_OPTIONS,
  PLAYER_BACKGROUND_OPTIONS,
  FUTSAL_POSITION_OPTIONS,
  SKILL_LEVEL_OPTIONS,
} from "@/entities/user/model/constants";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import { updateProfileData } from "../model/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  RatingData,
  SKILL_LEVEL_POINTS,
} from "@/app/onboarding/ui/OnboardingProfile";

const RATING_ITEMS = [
  { key: "shooting", label: "슈팅" },
  { key: "passing", label: "패스" },
  { key: "stamina", label: "체력" },
  { key: "physical", label: "피지컬" },
  { key: "dribbling", label: "드리블" },
  { key: "defense", label: "수비" },
] as const;

// 프로필 스키마 (개선된 버전)
const profileSchema = z.object({
  foot: z.enum(["LEFT", "RIGHT", "BOTH"], {
    error: () => "주발을 선택해주세요",
  }),
  position: z.enum(["PIVO", "ALA", "FIXO", "GOLEIRO"], {
    error: () => "포지션을 선택해주세요",
  }),
  condition: z.enum(["NORMAL", "INJURED"], {
    error: () => "부상 여부를 선택해주세요",
  }),
  playerBackground: z.enum(["NON_PROFESSIONAL", "PROFESSIONAL"], {
    error: () => "선수 출신 여부를 선택해주세요",
  }),
  skillLevel: z.enum(["BEGINNER", "AMATEUR", "ACE", "SEMIPRO"], {
    error: () => "실력 수준을 선택해주세요",
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileForm = ({ data }: { data: User }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      position: data.position as Position,
      foot: data.foot as "LEFT" | "RIGHT" | "BOTH",
      condition: data.condition as Condition,
      playerBackground: data.playerBackground as PlayerBackground,
      skillLevel: data.skillLevel as PlayerSkillLevel | undefined,
    },
  });

  const [ratings, setRatings] = useState<RatingData>({
    shooting: data.shooting,
    passing: data.passing,
    stamina: data.stamina,
    physical: data.physical,
    dribbling: data.dribbling,
    defense: data.defense,
  });

  const selectedSkillLevel = watch("skillLevel");

  // 현재 사용한 총 포인트 계산
  const totalUsedPoints = useMemo(() => {
    return Object.values(ratings).reduce((sum, value) => sum + value, 0);
  }, [ratings]);

  // 선택한 실력 등급에 따른 최대 포인트
  const maxPoints = selectedSkillLevel
    ? SKILL_LEVEL_POINTS[selectedSkillLevel]
    : 0;

  // 남은 포인트
  const remainingPoints = maxPoints - totalUsedPoints;

  useEffect(() => {
    if (remainingPoints < 0) {
      setRatings({
        shooting: 1,
        passing: 1,
        stamina: 1,
        physical: 1,
        dribbling: 1,
        defense: 1,
      });
    }
  }, [remainingPoints]);

  const handleRatingChange = (key: keyof RatingData, value: number) => {
    const currentValue = ratings[key];
    const pointDifference = value - currentValue;

    // 포인트 초과 여부 확인
    if (totalUsedPoints + pointDifference <= maxPoints) {
      setRatings((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  // 특정 점수 버튼이 비활성화되어야 하는지 확인
  const isScoreDisabled = (currentItemKey: keyof RatingData, score: number) => {
    const currentValue = ratings[currentItemKey];
    const pointDifference = score - currentValue;
    return totalUsedPoints + pointDifference > maxPoints;
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await updateProfileData({
        profile: {
          ...data,
        },
        ratings,
      });

      if (response.success) {
        alert("프로필이 성공적으로 저장되었습니다.");
        router.push("/more");
      } else {
        throw new Error(response.error || "저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Profile save error:", error);
      setError("root", {
        message: "처리 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border mx-4 space-y-6 p-4 bg-white rounded-2xl pt-6"
    >
      {/* 부상 여부 */}
      <div className="space-y-3">
        <Label className="px-1">부상</Label>
        <CustomRadioGroup
          options={CONDITION_OPTIONS}
          value={watch("condition")}
          onValueChange={(value) => setValue("condition", value as Condition)}
          error={errors.condition?.message}
        />
      </div>

      {/* 주발 */}
      <div className="space-y-3">
        <Label className="px-1">주로 사용하는 발</Label>
        <CustomRadioGroup
          name="foot"
          options={FOOT_OPTIONS}
          value={watch("foot")}
          onValueChange={(value) =>
            setValue("foot", value as "LEFT" | "RIGHT" | "BOTH")
          }
          error={errors.foot?.message}
        />
      </div>

      {/* 포지션 */}
      <div className="space-y-3">
        <Label className="px-1">선호하는 포지션</Label>
        <div className="grid sm:grid-cols-2 items-start gap-2">
          <div className="relative select-none sm:order-2">
            <div className="w-full h-full flex items-center justify-center ">
              <Image
                src="/full_pitch.svg"
                alt="position"
                width={806}
                height={406}
                className="object-cover"
              />
            </div>
            <div className="absolute w-full h-full top-0 left-0 flex">
              <div className="h-full w-1/4 flex items-center justify-center">
                <div
                  className={`mr-3 size-4 rounded-full ${
                    watch("position") === "GOLEIRO"
                      ? "bg-red-500"
                      : "bg-white/50"
                  }`}
                />
              </div>
              <div className="h-full w-1/4 flex items-center justify-center">
                <div
                  className={`size-4 rounded-full ${
                    watch("position") === "FIXO" ? "bg-red-500" : "bg-white/50"
                  }`}
                />
              </div>
              <div className="h-full w-1/4 flex flex-col justify-between items-center py-5 sm:py-4">
                <div
                  className={`size-4 rounded-full ${
                    watch("position") === "ALA" ? "bg-red-500" : "bg-white/50"
                  }`}
                />
                <div
                  className={`size-4 rounded-full ${
                    watch("position") === "ALA" ? "bg-red-500" : "bg-white/50"
                  }`}
                />
              </div>
              <div className="h-full w-1/4 flex items-center justify-center">
                <div
                  className={`size-4 rounded-full ${
                    watch("position") === "PIVO" ? "bg-red-500" : "bg-white/50"
                  }`}
                />
              </div>
              <div className="w-1/5 shrink-0" />
            </div>
          </div>
          <CustomRadioGroup
            options={FUTSAL_POSITION_OPTIONS}
            value={watch("position") ?? ""}
            onValueChange={(value) => setValue("position", value as Position)}
            error={errors.position?.message}
            containerClassName="grid gap-1"
          />
        </div>
      </div>

      {/* 선수 출신 여부 */}
      <div className="space-y-3">
        <Label className="px-1">출신</Label>
        <CustomRadioGroup
          options={PLAYER_BACKGROUND_OPTIONS}
          value={watch("playerBackground")}
          onValueChange={(value) => {
            setValue("playerBackground", value as PlayerBackground);

            if (
              value === "PROFESSIONAL" &&
              (watch("skillLevel") === "AMATEUR" ||
                watch("skillLevel") === "BEGINNER")
            ) {
              setValue("skillLevel", "SEMIPRO");
            }

            if (
              value === "NON_PROFESSIONAL" &&
              (watch("skillLevel") === "SEMIPRO" ||
                watch("skillLevel") === "ACE")
            ) {
              setValue("skillLevel", "BEGINNER");
            }
          }}
          error={errors.playerBackground?.message}
        />
      </div>

      {/* 실력 수준 */}
      <div className="space-y-3">
        <Label className="px-1">실력</Label>
        <CustomRadioGroup
          options={
            watch("playerBackground") === "PROFESSIONAL"
              ? SKILL_LEVEL_OPTIONS.filter(
                  (option) =>
                    option.value !== "AMATEUR" && option.value !== "BEGINNER"
                )
              : SKILL_LEVEL_OPTIONS
          }
          value={watch("skillLevel")}
          onValueChange={(value) =>
            setValue("skillLevel", value as PlayerSkillLevel)
          }
          error={errors.skillLevel?.message}
          containerClassName="grid gap-1 sm:grid-cols-2"
        />
      </div>

      {/* 능력치 */}
      {selectedSkillLevel && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="px-1">자기 평가</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">남은 포인트:</span>
              <span
                className={`text-sm font-semibold ${
                  remainingPoints === 0
                    ? "text-green-600"
                    : remainingPoints < 0
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {remainingPoints} / {maxPoints}
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {RATING_ITEMS.map((item, index) => (
              <div
                key={item.key}
                className="h-16 sm:h-16 flex items-center justify-between space-x-2 gap-1"
              >
                <div className="px-1 flex items-center gap-1">
                  <span className="text-sm font-gray-300">{index + 1}.</span>
                  <label className="sm:text-sm font-medium text-gray-700">
                    {item.label}
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const disabled = isScoreDisabled(item.key, score);
                    const isSelected = ratings[item.key] >= score;

                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => handleRatingChange(item.key, score)}
                        disabled={disabled}
                        className={`size-10 sm:size-9 rounded-full border transition-colors cursor-pointer ${
                          isSelected
                            ? "font-semibold bg-gray-700 border-transparent hover:bg-gray-500 text-white"
                            : disabled
                            ? "font-medium border-transparent text-gray-300 cursor-not-allowed bg-gray-50"
                            : "font-medium border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-700 cursor-pointer"
                        }`}
                      >
                        {score}
                      </button>
                    );
                  })}
                  <span className="hidden sm:block text-gray-600 ml-4 min-w-10 text-center">
                    <span className="font-medium text-gray-800">
                      {ratings[item.key]}
                    </span>
                    점
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {errors.root && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <div className="mt-12 space-y-3 sm:grid grid-cols-3 gap-2">
        {/* 저장 버튼 */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-semibold text-base"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </Button>

        {/*  취소 버튼 */}
        <Button
          type="button"
          disabled={isLoading}
          className="w-full font-medium text-base h-11 sm:h-12"
          onClick={() => router.push("/more")}
          variant="secondary"
          size="lg"
        >
          취소
        </Button>
      </div>

      {/* 최근 수정일 */}
      <div className="text-center text-sm font-medium mb-3 px-2 text-gray-600">
        최근 수정일:{" "}
        {data.updatedAt.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </form>
  );
};

export default ProfileForm;
