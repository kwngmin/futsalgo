"use client";

import { Label } from "@/shared/components/ui/label";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Team, TeamLevel } from "@prisma/client";
import { Button } from "@/shared/components/ui/button";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  TEAM_GENDER_OPTIONS,
  TEAM_LEVEL_OPTIONS,
  TEAM_RECRUITMENT_STATUS_OPTIONS,
} from "@/entities/team/model/constants";
import { Input } from "@/shared/components/ui/input";
import CustomSelect from "@/shared/components/ui/custom-select";
import { updateTeam } from "../model/actions";
import { editTeamFormSchema } from "../model/schema.model";
import { useRouter } from "next/navigation";

export type EditTeamFormData = z.infer<typeof editTeamFormSchema>;

const koreanCities = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
];

const EditTeamForm = ({
  data,
  teamId,
}: // userId,
{
  data: Team;
  teamId: string;
  userId: string;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  console.log(data, "data");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<EditTeamFormData>({
    resolver: zodResolver(editTeamFormSchema),
    defaultValues: {
      gender: data.gender,
      description: data.description || undefined,
      city: data.city,
      district: data.district,
      level: data.level,
      recruitmentStatus: data.recruitmentStatus,
    },
  });

  const onSubmit = async (formData: EditTeamFormData) => {
    setIsLoading(true);

    try {
      console.log("🚀 Submitting team update:", formData);

      const result = await updateTeam({
        // userId,
        teamId,
        data: formData,
      });
      console.log(result, "result");

      if (result.success) {
        console.log("✅ Team update successful:", result);

        // 성공 알림
        alert(result.message || "팀 정보가 업데이트되었습니다.");

        // 팀 상세 페이지로 리다이렉트 (선택사항)
        router.push(`/teams/${teamId}`);

        // 또는 현재 페이지에서 폼 상태만 리셋
        // router.refresh(); // 페이지 데이터 새로고침
      }
    } catch (error) {
      console.error("❌ Team update failed:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "팀 정보 업데이트에 실패했습니다.";

      // 에러 처리
      if (errorMessage.includes("권한이 없습니다")) {
        setError("root", { message: "팀 정보를 수정할 권한이 없습니다." });
      } else if (errorMessage.includes("로그인이 필요합니다")) {
        setError("root", { message: "로그인이 필요합니다." });
        router.push("/login");
      } else if (errorMessage.includes("입력")) {
        // 입력 데이터 관련 에러는 폼 에러로 표시
        setError("root", { message: errorMessage });
      } else {
        setError("root", {
          message: "팀 정보 업데이트 중 오류가 발생했습니다.",
        });
      }

      // 토스트 에러 알림
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-4 bg-white rounded-2xl pt-6"
    >
      <div className="space-y-3">
        <Label className="">팀 소개</Label>
        <Textarea
          {...register("description")}
          // className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
          className="min-h-24"
          placeholder="팀에 대한 간단한 소개를 작성해주세요"
        />
      </div>

      <div className="space-y-3">
        <Label className="px-1">팀원 모집</Label>
        <CustomRadioGroup
          options={TEAM_RECRUITMENT_STATUS_OPTIONS}
          value={watch("recruitmentStatus")}
          onValueChange={(value) =>
            setValue(
              "recruitmentStatus",
              value as "RECRUITING" | "NOT_RECRUITING"
            )
          }
          error={errors.recruitmentStatus?.message}
        />
      </div>

      <div className="space-y-3">
        <Label className="px-1">팀 구분</Label>
        <CustomRadioGroup
          options={TEAM_GENDER_OPTIONS}
          value={watch("gender")}
          onValueChange={(value) =>
            setValue("gender", value as "MALE" | "FEMALE")
          }
          error={errors.gender?.message}
        />
      </div>

      <div className="space-y-3">
        <Label className="px-1">팀 실력</Label>
        <CustomRadioGroup
          options={TEAM_LEVEL_OPTIONS}
          value={watch("level")}
          onValueChange={(value) => setValue("level", value as TeamLevel)}
          error={errors.level?.message}
          direction="vertical"
        />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3">
            <Label className="px-1">시/도</Label>
            <CustomSelect
              // hasPlaceholder
              placeholder="선택"
              options={koreanCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
              value={watch("city")}
              onChange={(e) => setValue("city", e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="px-1">구/군</Label>
            <Input
              type="text"
              {...register("district")}
              placeholder="구/군을 입력하세요"
            />
          </div>
        </div>
      </div>

      {errors.root && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      {/* 저장 버튼 */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-3 font-semibold text-base"
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

export default EditTeamForm;
