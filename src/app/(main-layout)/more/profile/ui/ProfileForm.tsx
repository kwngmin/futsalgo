import { Badge } from "@/shared/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { POSITION_OPTIONS } from "@/shared/constants/profile";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Condition, Position, User } from "@prisma/client";
import { Button } from "@/shared/components/ui/button";

// 프로필 스키마 (개선된 버전)
const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  nickname: z.string().min(1, "닉네임을 입력해주세요"),
  email: z.string().email("올바른 이메일 형식을 입력해주세요"),
  phone: z.string().min(10, "올바른 전화번호를 입력해주세요"),
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
    .max(new Date().getFullYear(), "출생년도는 현재 년도 이하여야 합니다")
    .optional()
    .or(z.literal("")),
  condition: z.enum(["NORMAL", "INJURED"], {
    error: () => "몸 상태를 선택해주세요",
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileForm = ({ data }: { data: User }) => {
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
      name: data.name || "",
      nickname: data.nickname || "",
      email: data.email || "",
      phone: data.phone || "",
      positions: data.positions || [],
      foot: data.foot as "LEFT" | "RIGHT" | "BOTH",
      gender: data.gender as "MALE" | "FEMALE",
      height: data.height as number,
      birthYear: data.birthYear || undefined,
      condition: data.condition as Condition,
    },
  });

  const selectedPositions = watch("positions");

  const togglePosition = (position: string) => {
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
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // API 호출 로직
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          positions: data.positions as Position[],
          birthYear: data.birthYear === "" ? undefined : data.birthYear,
        }),
      });

      if (response.ok) {
        // 성공 처리
        alert("프로필이 성공적으로 저장되었습니다.");
      } else {
        throw new Error("저장에 실패했습니다.");
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
      className="space-y-6 p-4 bg-white rounded-2xl"
    >
      {/* 포지션 */}
      <div className="space-y-3">
        <Label>선호하는 포지션 • {selectedPositions?.length || 0}/5</Label>
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
        {/* <p className="text-sm text-gray-500">
        선택된 포지션: {selectedPositions?.length || 0}/5
      </p> */}
        {errors.positions && (
          <Alert>
            <AlertDescription>{errors.positions.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* 주발 */}
      <div className="space-y-3">
        <Label>주로 사용하는 발</Label>
        <RadioGroup
          className="flex flex-wrap gap-2"
          value={watch("foot")}
          onValueChange={(value) =>
            setValue("foot", value as "LEFT" | "RIGHT" | "BOTH")
          }
        >
          {[
            { value: "RIGHT", label: "오른발" },
            { value: "LEFT", label: "왼발" },
            { value: "BOTH", label: "양발" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 rounded-md px-3 pb-0.5 cursor-pointer min-w-24 border border-input h-10 pt-0.5"
              htmlFor={option.value}
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <span
                className={`text-sm leading-none ${
                  option.value === watch("foot")
                    ? "font-semibold"
                    : "font-medium"
                }`}
              >
                {option.label}
              </span>
            </label>
          ))}
        </RadioGroup>
        {errors.foot && (
          <Alert>
            <AlertDescription>{errors.foot.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* 몸 상태 */}
      <div className="space-y-3">
        <Label>몸 상태</Label>
        <RadioGroup
          className="flex flex-wrap gap-2"
          value={watch("condition")}
          onValueChange={(value) => setValue("condition", value as Condition)}
        >
          {[
            { value: "NORMAL", label: "정상" },
            { value: "INJURED", label: "부상" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 rounded-md px-3 pb-0.5 cursor-pointer min-w-24 border border-input h-10 pt-0.5"
              htmlFor={option.value}
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <span
                className={`text-sm leading-none ${
                  option.value === watch("condition")
                    ? "font-semibold"
                    : "font-medium"
                }`}
              >
                {option.label}
              </span>
            </label>
          ))}
        </RadioGroup>
        {errors.condition && (
          <Alert>
            <AlertDescription>{errors.condition.message}</AlertDescription>
          </Alert>
        )}
      </div>

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
          출생년도<span className="text-gray-400">(선택)</span>
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
        <RadioGroup
          className="flex flex-wrap gap-2"
          value={watch("gender")}
          onValueChange={(value) =>
            setValue("gender", value as "MALE" | "FEMALE")
          }
        >
          {[
            { value: "MALE", label: "남성" },
            { value: "FEMALE", label: "여성" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 rounded-md px-3 pb-0.5 cursor-pointer min-w-24 border border-input h-10 pt-0.5"
              htmlFor={option.value}
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <span
                className={`text-sm leading-none ${
                  option.value === watch("gender")
                    ? "font-semibold"
                    : "font-medium"
                }`}
              >
                {option.label}
              </span>
            </label>
          ))}
        </RadioGroup>
        {errors.gender && (
          <Alert>
            <AlertDescription>{errors.gender.message}</AlertDescription>
          </Alert>
        )}
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
