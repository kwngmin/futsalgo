"use client";

import { useCallback, useMemo, useState } from "react";
import { Camera, Upload, MapPin, ScrollText, X } from "lucide-react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import {
  TEAM_GENDER_OPTIONS,
  TEAM_LEVEL_OPTIONS,
  TEAM_MATCH_AVAILABLE_OPTIONS,
} from "@/entities/team/model/constants";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { createTeam } from "@/app/(no-layout)/teams/create/model/actions/create-team";
import { useRouter } from "next/navigation";
import { Textarea } from "@/shared/components/ui/textarea";
import CustomSelect from "@/shared/components/ui/custom-select";
import { Button } from "@/shared/components/ui/button";
import { TeamLevel } from "@prisma/client";
import { cityData } from "@/features/search-address-sgis/constants";
import { useDistricts } from "@/app/(main-layout)/schedules/lib/use-districts";
import { useQueryClient } from "@tanstack/react-query";
import { useTeamNameValidation } from "@/features/validation/hooks/use-team-name-validation";

const teamSchema = z.object({
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
  teamMatchAvailable: z.enum(["AVAILABLE", "UNAVAILABLE"], {
    error: () => "친선전 초청 가능 여부를 선택해주세요",
  }),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
});

export type TeamFormData = z.infer<typeof teamSchema>;

const TeamsCreateContent = ({ ownerId }: { ownerId: string }) => {
  const queryClient = useQueryClient();
  const [selectedCity, setSelectedCity] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>();

  const router = useRouter();

  // 팀 이름 validation hook
  const { teamName, onChange: onTeamNameChange } = useTeamNameValidation();
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
      teamMatchAvailable: "AVAILABLE",
      instagram: undefined,
      youtube: undefined,
    },
  });

  // 선택된 도시의 코드 조회
  const selectedCityCode = useMemo(() => {
    return cityData.find((city) => city.addr_name === selectedCity)?.cd;
  }, [selectedCity]);

  // 시군구 데이터 조회
  const { data: districtsData, isLoading: isDistrictsLoading } =
    useDistricts(selectedCityCode);

  // 시도 옵션 - 메모이제이션
  const cityOptions = useMemo(
    () =>
      cityData.map((city) => (
        <option key={city.addr_name} value={city.addr_name}>
          {city.addr_name}
        </option>
      )),
    []
  );

  // 시군구 옵션 - 메모이제이션
  const districtOptions = useMemo(
    () =>
      districtsData?.result?.map((district) => (
        <option key={district.addr_name} value={district.addr_name}>
          {district.addr_name}
        </option>
      )) || [],
    [districtsData?.result]
  );

  const handleCityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const cityName = e.target.value;
      setSelectedCity(cityName);
      setValue("city", cityName);
      // 도시 변경 시 구/군 선택 초기화
      setSelectedDistrict(undefined);
      setValue("district", "");
    },
    [setSelectedCity, setValue]
  );

  const handleDistrictChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedDistrict(e.target.value);
      setValue("district", e.target.value);
    },
    [setSelectedDistrict, setValue]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: TeamFormData) => {
    // 팀 이름 validation 체크
    if (teamName.status === "invalid" || teamName.status === "checking") {
      setError("name", { message: "팀 이름을 확인해주세요." });
      return;
    }

    setIsSubmitting(true);

    try {
      // 여기에 팀 생성 API 호출 로직 추가
      const team = await createTeam({
        ...{ data, city: selectedCity, district: selectedDistrict },
        ownerId,
      });

      if (team) {
        alert("팀이 성공적으로 생성되었습니다!");
        // 쿼리 무효화를 병렬로 처리하여 성능 향상
        queryClient.invalidateQueries({
          queryKey: ["teams"],
          refetchType: "all",
        });
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

  console.log(errors, "errors");

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <h1 className="text-[1.625rem] font-bold">새로운 팀</h1>
        <button
          className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
          onClick={() => router.back()}
        >
          <X className="size-6" />
        </button>
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
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <ScrollText className="size-5" />
                <span className="font-medium">기본 정보</span>
              </div>
            </div>
            <div className="space-y-6 p-4">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="">팀 이름</Label>
                  <Input
                    {...register("name")}
                    type="text"
                    placeholder="팀 이름을 입력하세요"
                    value={teamName.value}
                    onChange={(e) => {
                      onTeamNameChange(e.target.value);
                      setValue("name", e.target.value);
                    }}
                  />
                  {teamName.status === "checking" && (
                    <p className="text-sm text-blue-600 font-medium">
                      팀 이름을 확인하고 있습니다...
                    </p>
                  )}
                  {teamName.status === "valid" && (
                    <p className="text-sm text-green-600 font-medium">
                      사용 가능한 팀 이름입니다.
                    </p>
                  )}
                  {teamName.status === "invalid" && teamName.error && (
                    <p className="text-sm text-red-600 font-medium">
                      {teamName.error}
                    </p>
                  )}
                  {errors.name && (
                    <p className="text-sm text-red-600 font-medium">
                      {errors.name.message}
                    </p>
                  )}
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
                    // disabled={}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="px-1">친선전 초청 여부</Label>
                  <CustomRadioGroup
                    options={TEAM_MATCH_AVAILABLE_OPTIONS}
                    value={watch("teamMatchAvailable")}
                    onValueChange={(value) =>
                      setValue(
                        "teamMatchAvailable",
                        value as "AVAILABLE" | "UNAVAILABLE"
                      )
                    }
                    error={errors.teamMatchAvailable?.message}
                  />
                </div>

                {/* 팀 실력 */}
                <div className="space-y-3">
                  <Label className="px-1">팀 실력</Label>
                  <CustomRadioGroup
                    options={TEAM_LEVEL_OPTIONS}
                    value={watch("level")}
                    onValueChange={(value) =>
                      setValue("level", value as TeamLevel)
                    }
                    error={errors.level?.message}
                    containerClassName="grid gap-1"
                  />
                </div>

                {/* 인스타그램, 유튜브 */}
                <div className="grid sm:grid-cols-3 gap-x-1 gap-y-6">
                  <div className="space-y-3">
                    <Label className="px-1">인스타그램 (선택)</Label>
                    <Input
                      type="text"
                      {...register("instagram")}
                      placeholder="아이디를 입력하세요"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="px-1">유튜브 (선택)</Label>
                    <Input
                      type="text"
                      {...register("youtube")}
                      placeholder="채널명을 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 활동 지역 섹션 */}
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <MapPin className="size-5" />
                <span className="font-medium">활동 지역</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 shrink-0 p-4">
              <CustomSelect
                key={`city-${selectedCity}`}
                placeholder="시도 선택"
                className="min-w-32 shrink-0"
                options={cityOptions}
                value={selectedCity || ""}
                onChange={handleCityChange}
                aria-label="시도 선택"
              />

              <CustomSelect
                key={`district-${selectedDistrict}`}
                disabled={!selectedCity || isDistrictsLoading}
                placeholder={isDistrictsLoading ? "로딩 중..." : "시군구 선택"}
                className="min-w-32 shrink-0"
                options={districtOptions}
                value={selectedDistrict || ""}
                onChange={handleDistrictChange}
                aria-label="시군구 선택"
              />
            </div>
          </div>

          {errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <div className="mt-8 space-y-2 sm:grid grid-cols-3 gap-2">
            {/* 제출 버튼 */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "등록 중..." : "등록하기"}
            </Button>
            <Button
              onClick={() => router.back()}
              type="button"
              size="lg"
              variant="ghost"
              className="w-full h-10 text-base font-semibold"
              disabled={isSubmitting}
            >
              취소
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TeamsCreateContent;
