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
} from "@/entities/team/model/constants";
import { Input } from "@/shared/components/ui/input";
import CustomSelect from "@/shared/components/ui/custom-select";

const editTeamFormSchema = z.object({
  // name: z.string().min(1, "팀 이름을 입력해주세요"),
  gender: z.enum(["MALE", "FEMALE", "MIXED"], {
    error: () => "성별을 선택해주세요",
  }),
  description: z.string().min(1, "팀 소개를 입력해주세요"),
  city: z.string().min(1, "시/도를 선택해주세요"),
  district: z.string().min(1, "구/군을 입력해주세요"),
  level: z.enum(["VERY_LOW", "LOW", "MID", "HIGH", "VERY_HIGH"], {
    error: () => "팀 실력을 선택해주세요",
  }),
});

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

const EditTeamForm = ({ data }: { data: Team }) => {
  //   const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    // setError,
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
    },
  });

  const onSubmit = async (data: EditTeamFormData) => {
    setIsLoading(true);
    console.log(data);
    setIsLoading(false);
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
          placeholder="팀에 대한 간단한 소개를 작성해주세요"
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
              hasPlaceholder
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
        size="lg"
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
