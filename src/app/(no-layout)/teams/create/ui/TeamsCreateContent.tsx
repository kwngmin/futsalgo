"use client";

import { useState } from "react";
import { Camera, Upload, MapPin } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import { GENDER_OPTIONS } from "@/entities/team/model/constants";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { createTeam } from "@/app/(no-layout)/profile/model/server-actions";
import { useRouter } from "next/navigation";

const teamSchema = z.object({
  name: z.string().min(1, "팀 이름을 입력해주세요"),
  gender: z.enum(["MALE", "FEMALE", "MIXED"], {
    error: () => "성별을 선택해주세요",
  }),
  description: z.string().min(1, "팀 소개를 입력해주세요"),
  city: z.string().min(1, "시/도를 선택해주세요"),
  district: z.string().min(1, "구/군을 입력해주세요"),
});

export type TeamFormData = z.infer<typeof teamSchema>;

const TeamsCreateContent = ({ ownerId }: { ownerId: string }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      gender: "MIXED",
      description: "",
      city: "",
      district: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: TeamFormData) => {
    setIsSubmitting(true);

    try {
      // 여기에 팀 생성 API 호출 로직 추가
      const team = await createTeam({
        data,
        ownerId,
      });

      if (team) {
        alert("팀이 성공적으로 생성되었습니다!");
        router.push(`/teams`);
      } else {
        throw new Error("팀 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("팀 생성 실패:", error);
      alert("팀 생성에 실패했습니다. 다시 시도해주세요.");
      setError("root", {
        message: "팀 생성에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // const frequencyOptions = [
  //   { value: "WEEKLY", label: "주 1회" },
  //   { value: "BIWEEKLY", label: "격주" },
  //   { value: "MONTHLY", label: "월 1회" },
  //   { value: "IRREGULAR", label: "불규칙" },
  // ];

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

  return (
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl pb-16 flex flex-col">
      <div className="flex items-center justify-between h-16 shrink-0 px-3">
        <h1 className="text-2xl font-bold">팀 만들기</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-3 space-y-6">
        {/* 팀 이미지 섹션 */}
        <div className="space-y-4 hidden">
          <h2 className="text-lg font-semibold">팀 이미지</h2>

          {/* 커버 이미지 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              커버 이미지
            </h3>
            <div className="relative w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 mt-1">커버 이미지 업로드</p>
              </div>
            </div>
          </div>

          {/* 로고 이미지 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              로고 이미지
            </h3>
            <div className="relative w-20 h-20 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              <Camera className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* 팀 정보 섹션 */}
        <div className="space-y-4">
          <div className="space-y-6 p-4 bg-white rounded-2xl">
            <h2 className="text-lg font-semibold">팀 정보</h2>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="">팀 이름</Label>
                <Input
                  {...register("name")}
                  type="text"
                  placeholder="팀 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  팀 소개
                </label>
                <textarea
                  {...register("description")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                  placeholder="팀에 대한 간단한 소개를 작성해주세요"
                />
              </div>

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
            </div>
          </div>

          {/* 활동 지역 섹션 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              활동 지역
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  시/도 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("city")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">선택하세요</option>
                  {koreanCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  구/군 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("district")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* 제출 버튼 */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "팀 생성 중..." : "팀 만들기"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TeamsCreateContent;
