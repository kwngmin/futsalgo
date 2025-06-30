"use client";

import { Label } from "@/shared/components/ui/label";
import { CalendarIcon, ChevronDownIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { TeamMember } from "@prisma/client";
import { Button } from "@/shared/components/ui/button";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import { Textarea } from "@/shared/components/ui/textarea";
import { MATCH_TYPE_OPTIONS } from "@/entities/team/model/constants";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { addNewSchedule } from "@/features/add-schedule/model/actions/add-new-schedule";

const newFormSchema = z.object({
  title: z.string().optional(),
  place: z.string().min(1),
  description: z.string().optional(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  matchType: z.string().min(1),
});

export type NewFormData = z.infer<typeof newFormSchema>;

const NewForm = ({
  data,
  teamId,
  userId,
}: {
  data: TeamMember;
  teamId: string;
  userId: string;
}) => {
  console.log(userId, "userId");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();

  console.log(data, "data");
  console.log(teamId, "teamId");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<NewFormData>({
    resolver: zodResolver(newFormSchema),
    defaultValues: {
      matchType: "SQUAD",
    },
  });
  console.log(watch("date"), "watch");
  const onSubmit = async (formData: NewFormData) => {
    setIsLoading(true);
    console.log(formData, "formData");

    try {
      console.log("🚀 Submitting team update:", formData);

      const result = await addNewSchedule({
        userId,
        teamId,
        data: {
          place: formData.place,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          matchType: formData.matchType,
        },
      });
      console.log(result, "result");

      if (result.success) {
        console.log("✅ Team update successful:", result);

        // 성공 알림
        alert("일정이 추가되었습니다.");
        // alert(result.data.message || "팀 정보가 업데이트되었습니다.");

        // 팀 상세 페이지로 리다이렉트 (선택사항)
        // router.push(`/teams/${teamId}`);

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
        // router.push("/login");
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

  console.log(errors, "errors");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-4 bg-white rounded-2xl pt-6"
    >
      {/* <div className="space-y-3">
        <Label className="">제목</Label>
        <Input
          type="text"
          placeholder="제목을 입력하세요"
          {...register("title")}
          // className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
          // className="min-h-24"
          // placeholder="일정에 대한 간단한 소개를 작성해주세요"
        />
      </div> */}

      <div className="space-y-3">
        <Label className="px-1">매치 타입</Label>
        <CustomRadioGroup
          options={MATCH_TYPE_OPTIONS}
          value={watch("matchType")}
          onValueChange={(value) =>
            setValue("matchType", value as "TEAM" | "SQUAD")
          }
          error={errors.matchType?.message}
          direction="vertical"
        />
      </div>

      <div className="space-y-3">
        <Label className="">장소</Label>
        <Input
          type="text"
          placeholder="장소를 입력하세요"
          {...register("place")}
          // className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
          // className="min-h-24"
          // placeholder="일정에 대한 간단한 소개를 작성해주세요"
        />
      </div>

      <div className="flex flex-wrap space-y-6 space-x-2">
        <div className="flex flex-col gap-3 grow sm:grow-0">
          <Label htmlFor="date-picker" className="px-1">
            대관 일자
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className="min-w-48 justify-between font-normal !h-10"
                // size="lg"
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon />
                  {date ? date.toLocaleDateString() : "일자를 선택하세요"}
                </div>
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  console.log(date, "date");
                  if (!date) return;
                  const dateData = new Date(date);
                  const year = dateData.getFullYear();
                  setValue(
                    "date",
                    `${year}-${String(dateData.getMonth() + 1).padStart(
                      2,
                      "0"
                    )}-${String(dateData.getDate()).padStart(2, "0")}`
                  );
                  // setValue("date", date?.toISOString() || "");
                  setDate(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="time-picker" className="px-1">
            시작 시간 - 종료시간
          </Label>
          <div className="flex gap-2">
            <Input
              type="time"
              id="time-picker"
              defaultValue="06:00"
              {...register("startTime")}
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-500">~</span>
            </div>
            <Input
              type="time"
              id="time-picker"
              defaultValue="08:00"
              {...register("endTime")}
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="">안내사항</Label>
        <Textarea
          {...register("description")}
          // className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
          className="min-h-24"
          placeholder="안내사항을 작성해주세요"
        />
      </div>

      {/* <div className="space-y-3">
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
      </div> */}

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

export default NewForm;
