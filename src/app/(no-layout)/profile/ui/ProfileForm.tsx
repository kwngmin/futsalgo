import { Badge } from "@/shared/components/ui/badge";
import { Label } from "@/shared/components/ui/label";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { Condition, Position, User } from "@prisma/client";
import { Button } from "@/shared/components/ui/button";
import {
  CONDITION_OPTIONS,
  FOOT_OPTIONS,
  POSITION_OPTIONS,
} from "@/entities/user/model/constants";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import { updateProfileData } from "../model/actions";
import { useRouter } from "next/navigation";

// 프로필 스키마 (개선된 버전)
const profileSchema = z.object({
  foot: z.enum(["LEFT", "RIGHT", "BOTH"], {
    error: () => "주발을 선택해주세요",
  }),
  positions: z
    .array(z.string())
    .min(1, "최소 1개의 포지션을 선택해주세요")
    .max(5, "최대 5개의 포지션까지 선택 가능합니다"),
  condition: z.enum(["NORMAL", "INJURED"], {
    error: () => "몸 상태를 선택해주세요",
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
      positions: data.positions || [],
      foot: data.foot as "LEFT" | "RIGHT" | "BOTH",
      condition: data.condition as Condition,
    },
  });

  const selectedPositions = watch("positions");

  const togglePosition = useCallback(
    (position: string) => {
      const current = selectedPositions || [];
      let updated: string[];

      if (current.includes(position)) {
        updated = current.filter((p) => p !== position);
      } else if (current.length < 5) {
        updated = [...current, position];
      } else {
        return;
      }

      setValue("positions", updated);
    },
    [selectedPositions, setValue]
  );

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
      className="space-y-6 p-4 bg-white rounded-2xl pt-6"
    >
      {/* 몸 상태 */}
      <div className="space-y-2">
        <Label className="font-semibold text-base text-muted-foreground">
          몸 상태
        </Label>
        <CustomRadioGroup
          options={CONDITION_OPTIONS}
          value={watch("condition")}
          onValueChange={(value) => setValue("condition", value as Condition)}
          error={errors.condition?.message}
        />
      </div>

      {/* 포지션 */}
      <div className="space-y-2">
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

      {/* 주발 */}
      <div className="space-y-2">
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

      {errors.root && (
        <Alert>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      {/* 저장 버튼 */}
      <Button type="submit" disabled={isLoading} className="w-full mt-6">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            저장 중...
          </>
        ) : (
          "저장"
        )}
      </Button>

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
