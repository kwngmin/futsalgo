"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { User } from "@prisma/client";
import { Button } from "@/shared/components/ui/button";
import { GENDER_OPTIONS } from "@/entities/user/model/constants";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import { updateProfileData } from "../../model/actions";

// 프로필 스키마 (개선된 버전)
const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  gender: z.enum(["MALE", "FEMALE"], {
    error: () => "성별을 선택해주세요",
  }),
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

const ProfileBasicForm = ({
  data,
  onSuccess,
}: {
  data: User;
  onSuccess: () => void;
}) => {
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
      name: data.name as string,
      gender: data.gender as "MALE" | "FEMALE",
      height: data.height as number,
      birthYear: data.birthYear as number,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await updateProfileData({
        profile: data,
      });

      if (response.success) {
        alert("프로필이 성공적으로 저장되었습니다.");
        onSuccess?.(); // 성공 시 콜백 실행 (모달 닫기)
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name" className="gap-1">
          이름 (실명)
        </Label>
        <Input
          {...register("name")}
          id="name"
          type="text"
          placeholder="이름을 입력하세요"
        />
        {errors.name && (
          <Alert>
            <AlertDescription>{errors.name.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* 출생년도 */}
      <div className="space-y-2">
        <Label htmlFor="birthYear" className="gap-1">
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

      {/* 성별 */}
      <div className="space-y-3">
        <Label>성별</Label>
        <CustomRadioGroup
          options={GENDER_OPTIONS}
          value={watch("gender")}
          onValueChange={(value) =>
            setValue("gender", value as "MALE" | "FEMALE")
          }
          error={errors.gender?.message}
        />
      </div>

      {errors.root && (
        <Alert>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      {/* 신장 */}
      <div className="space-y-2">
        <Label htmlFor="height">키 (cm)</Label>
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
    </form>
  );
};

export default ProfileBasicForm;
