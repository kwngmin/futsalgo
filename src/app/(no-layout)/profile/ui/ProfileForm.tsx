import { Label } from "@/shared/components/ui/label";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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

// 프로필 스키마 (개선된 버전)
const profileSchema = z.object({
  foot: z.enum(["LEFT", "RIGHT", "BOTH"], {
    error: () => "주발을 선택해주세요",
  }),
  position: z.enum(["PIVO", "ALA", "FIXO", "GOLEIRO"], {
    error: () => "포지션을 선택해주세요",
  }),
  condition: z.enum(["NORMAL", "INJURED"], {
    error: () => "몸 상태를 선택해주세요",
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

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await updateProfileData({
        profile: {
          ...data,
        },
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
      {/* 몸 상태 */}
      <div className="space-y-3">
        <Label className="px-1">몸 상태</Label>
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
        <CustomRadioGroup
          options={FUTSAL_POSITION_OPTIONS}
          value={watch("position") ?? ""}
          onValueChange={(value) => setValue("position", value as Position)}
          error={errors.position?.message}
          direction="vertical"
        />
      </div>

      {/* 선수 출신 여부 */}
      <div className="space-y-3">
        <Label className="px-1">출신</Label>
        <CustomRadioGroup
          options={PLAYER_BACKGROUND_OPTIONS}
          value={watch("playerBackground")}
          onValueChange={(value) => {
            setValue("playerBackground", value as PlayerBackground);
            if (value === "PROFESSIONAL") {
              setValue("skillLevel", "SEMIPRO");
            } else {
              setValue("skillLevel", "BEGINNER");
            }
          }}
          error={errors.playerBackground?.message}
        />
      </div>

      {/* 실력 수준 */}
      <div className="space-y-3 sm:hidden">
        <Label className="px-1">실력</Label>
        <CustomRadioGroup
          options={SKILL_LEVEL_OPTIONS}
          value={watch("skillLevel")}
          onValueChange={(value) =>
            setValue("skillLevel", value as PlayerSkillLevel)
          }
          error={errors.skillLevel?.message}
          direction="vertical"
        />
      </div>
      <div className="space-y-3 hidden sm:block">
        <Label className="px-1">실력</Label>
        <CustomRadioGroup
          options={SKILL_LEVEL_OPTIONS}
          value={watch("skillLevel")}
          onValueChange={(value) =>
            setValue("skillLevel", value as PlayerSkillLevel)
          }
          error={errors.skillLevel?.message}
        />
      </div>

      {errors.root && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <div className="mt-3 space-y-3">
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
          className="w-full font-medium text-base h-11"
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
