"use client";

import {
  TEAM_GENDER_OPTIONS,
  TEAM_LEVEL_OPTIONS,
} from "@/entities/team/model/constants";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import CustomSelect from "@/shared/components/ui/custom-select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Team, TeamLevel } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

const editTeamFormSchema = z.object({
  name: z.string().min(1, "팀 이름을 입력해주세요"),
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

const EditTeamForm = ({ team }: { team: Team }) => {
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
      name: team.name,
      gender: team.gender,
      description: team.description || undefined,
      city: team.city,
      district: team.district,
      level: team.level,
    },
  });

  const onSubmit = async (data: EditTeamFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 팀 이미지 섹션 */}
      <div className="space-y-4 hidden">
        <h2 className="text-lg font-semibold">팀 이미지</h2>

        {/* 커버 이미지 */}
        {/* <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            커버 이미지
          </h3>
          <div className="relative w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500 mt-1">커버 이미지 업로드</p>
            </div>
          </div>
        </div> */}

        {/* 로고 이미지 */}
        {/* <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            로고 이미지
          </h3>
          <div className="relative w-20 h-20 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
            <Camera className="h-6 w-6 text-gray-400" />
          </div>
        </div> */}
      </div>

      {/* 팀 정보 섹션 */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="space-y-6 p-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="">팀 이름</Label>
                <Input
                  {...register("name")}
                  type="text"
                  placeholder="팀 이름을 입력하세요"
                />
              </div>

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
                  onValueChange={(value) =>
                    setValue("level", value as TeamLevel)
                  }
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
            </div>
          </div>
        </div>

        {errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* 제출 버튼 */}
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base font-semibold"
          // disabled={isSubmitting}
        >
          수정하기
          {/* {isSubmitting ? "팀 생성 중..." : "팀 만들기"} */}
        </Button>
        <Button
          // onClick={() => router.back()}
          type="button"
          size="lg"
          variant="ghost"
          className="w-full h-10 text-base font-semibold"
          // disabled={isSubmitting}
        >
          취소
        </Button>
      </div>
    </form>
  );
};

export default EditTeamForm;
