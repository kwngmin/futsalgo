"use client";

import { Label } from "@/shared/components/ui/label";
import { CalendarIcon, Check, ChevronDownIcon, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import { Textarea } from "@/shared/components/ui/textarea";
import { MATCH_TYPE_OPTIONS } from "@/entities/team/model/constants";
import { Input } from "@/shared/components/ui/input";
import { Calendar } from "@/shared/components/ui/calendar";
import { addNewSchedule } from "@/features/add-schedule/model/actions/add-new-schedule";
import { useRouter } from "next/navigation";
import { ko } from "date-fns/locale";
import { TeamWithBasicInfo } from "@/features/add-schedule/model/actions/get-my-teams";
import CustomSelect from "@/shared/components/ui/custom-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useTeamCodeValidation } from "@/features/validation/hooks/use-validation";
// import Image from "next/image";

const newFormSchema = z.object({
  hostTeamId: z.string().min(1),
  title: z.string().optional(),
  place: z.string().min(1),
  description: z.string().optional(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  matchType: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  enableAttendanceVote: z.boolean(),
  attendanceDeadline: z.string().min(1),
  attendanceEndTime: z.string().min(1),
});

export type NewFormData = z.infer<typeof newFormSchema>;

const NewForm = ({
  teams,
  userId,
}: {
  teams: TeamWithBasicInfo[];
  userId: string;
}) => {
  console.log(userId, "userId");
  console.log(teams, "teams");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [matchDate, setMatchDate] = useState<Date>();
  const [deadlineDate, setDeadlineDate] = useState<Date>();

  const { teamCode, onChange } = useTeamCodeValidation();

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
      // city: data.city,
      // district: data.district,
      enableAttendanceVote: false,
      hostTeamId: teams.length === 1 ? teams[0].team.id : "",
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
        teamId: formData.hostTeamId, // 임시
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
        router.push(`/schedule/${result.data.id}`);

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
      className="space-y-6 px-4 py-2 bg-white rounded-2xl"
    >
      <div className="flex flex-col sm:flex-row gap-x-4 gap-y-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 pb-3 sm:pb-0">
            <Label htmlFor="date-picker" className="px-1">
              날짜
            </Label>
            <Calendar
              mode="single"
              selected={matchDate}
              className="rounded-md border pb-12 sm:pb-7 w-full [--cell-size:--spacing(11.75)] sm:[--cell-size:--spacing(10)] mx-auto shadow-xs"
              disabled={(date) => date < new Date()}
              locale={ko}
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
                setMatchDate(date);
              }}
            />
          </div>
          {/* 시간 */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="time-picker" className="px-1">
              시간 (시작 - 종료)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                id="time-picker"
                defaultValue="06:00"
                {...register("startTime")}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none min-w-32 text-sm"
              />
              -
              <Input
                type="time"
                id="time-picker"
                defaultValue="08:00"
                {...register("endTime")}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none min-w-32 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 grow">
          {/* 장소 */}
          <div className="space-y-3">
            <Label className="">장소</Label>
            <Input
              type="text"
              placeholder="장소를 입력하세요"
              {...register("place")}
            />
          </div>

          {/* 주최팀 */}
          <div className="space-y-3">
            <Label className="px-1">주최팀</Label>
            <CustomSelect
              hasPlaceholder
              options={teams.map((t) => (
                <option key={t.team.id} value={t.team.id}>
                  {t.team.name}
                </option>
              ))}
              value={watch("hostTeamId")}
              onChange={(e) => setValue("hostTeamId", e.target.value)}
              disabled={teams.length === 1}
            />
          </div>

          {/* 매치 타입 */}
          <div className="space-y-3">
            <Label className="px-1">경기 구분</Label>
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

          {/* 팀 코드 */}
          {watch("matchType") === "TEAM" && (
            <div className="space-y-3">
              <Label htmlFor="nickname">초청팀 코드</Label>
              <div className="relative">
                <Input
                  id="nickname"
                  type="text"
                  value={teamCode.value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="초청팀 코드를 입력하세요"
                />
                {teamCode.status === "checking" && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
                )}
                {teamCode.status === "valid" && (
                  <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
                )}
                {teamCode.status === "invalid" && (
                  <X className="absolute right-3 top-2.5 h-4 w-4 text-red-600" />
                )}
              </div>
              {teamCode.error && (
                <Alert
                  variant="destructive"
                  className="bg-destructive/5 border-none"
                >
                  <AlertDescription>{teamCode.error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="">안내 사항</Label>
        <Textarea
          {...register("description")}
          // className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
          className="min-h-24"
          placeholder="안내 사항을 작성해주세요"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-y-6 gap-x-2">
        {/* 참석여부 투표 */}
        <div className="space-y-3">
          <Label className="">참석여부 투표</Label>
          <div className="flex items-center p-0.5 bg-muted w-fit rounded-lg">
            <button
              type="button"
              className={`h-10 sm:h-9 rounded-md px-4 min-w-24 text-sm font-semibold cursor-pointer transition-all duration-200 border ${
                watch("enableAttendanceVote")
                  ? "bg-white shadow-xs"
                  : "text-muted-foreground border-transparent"
              }`}
              onClick={() => setValue("enableAttendanceVote", true)}
            >
              사용
            </button>
            <button
              type="button"
              className={`h-10 sm:h-9 rounded-md px-4 min-w-24 text-sm font-semibold cursor-pointer transition-all duration-200  border ${
                !watch("enableAttendanceVote")
                  ? "bg-white shadow-xs"
                  : "text-muted-foreground border-transparent"
              }`}
              onClick={() => setValue("enableAttendanceVote", false)}
            >
              사용 안 함
            </button>
          </div>
        </div>

        {watch("enableAttendanceVote") && (
          <div className="hidden sm:grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-3 grow sm:grow-0">
              <Label htmlFor="date-picker" className="px-1">
                투표 종료 일자
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="min-w-48 justify-between font-normal !h-11 sm:!h-10"
                    disabled={!matchDate}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarIcon />
                      {deadlineDate
                        ? deadlineDate.toLocaleDateString()
                        : "일자를 선택하세요"}
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
                    selected={deadlineDate}
                    locale={ko}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // 오늘 00:00

                      if (matchDate) {
                        const match = new Date(matchDate);
                        match.setDate(match.getDate() - 1); // 하루 전
                        match.setHours(23, 59, 59, 999); // 그날의 끝 시간

                        return date < today || date > match;
                      }

                      return date < today;
                    }}
                    onSelect={(date) => {
                      console.log(date, "date");
                      if (!date) return;
                      const dateData = new Date(date);
                      const year = dateData.getFullYear();
                      setValue(
                        "attendanceDeadline",
                        `${year}-${String(dateData.getMonth() + 1).padStart(
                          2,
                          "0"
                        )}-${String(dateData.getDate()).padStart(2, "0")}`
                      );
                      setDeadlineDate(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="time-picker" className="px-1">
                투표 종료 시간
              </Label>
              <Input
                type="time"
                id="time-picker"
                defaultValue="06:00"
                {...register("startTime")}
                disabled={!matchDate}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none min-w-32 text-sm"
              />
            </div>
          </div>
        )}

        {watch("enableAttendanceVote") && (
          <div className="flex flex-col gap-6 sm:hidden">
            <div className="flex flex-col gap-3 pb-3 sm:pb-0">
              <Label htmlFor="date-picker" className="px-1">
                투표 종료 일자
              </Label>
              <Calendar
                mode="single"
                selected={deadlineDate}
                className={`rounded-md border pb-12 sm:pb-6 w-full [--cell-size:--spacing(11.75)] sm:[--cell-size:--spacing(10)] mx-auto ${
                  !matchDate ? "opacity-50 pointer-events-none" : ""
                }`}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // 오늘 00:00

                  if (matchDate) {
                    const match = new Date(matchDate);
                    match.setDate(match.getDate() - 1); // 하루 전
                    match.setHours(23, 59, 59, 999); // 그날의 끝 시간

                    return date < today || date > match;
                  }

                  return date < today;
                }}
                locale={ko}
                onSelect={(date) => {
                  console.log(date, "date");
                  if (!date) return;
                  const dateData = new Date(date);
                  const year = dateData.getFullYear();
                  setValue(
                    "attendanceDeadline",
                    `${year}-${String(dateData.getMonth() + 1).padStart(
                      2,
                      "0"
                    )}-${String(dateData.getDate()).padStart(2, "0")}`
                  );
                  setDeadlineDate(date);
                }}
              />
            </div>
            {/* 시간 */}
            <div className="flex flex-col gap-3 w-1/2">
              <Label htmlFor="time-picker" className="px-1">
                투표 종료 시간
              </Label>
              <Input
                type="time"
                id="time-picker"
                defaultValue="06:00"
                {...register("startTime")}
                disabled={!matchDate}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none min-w-32 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* <div className="space-y-6">
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

      <div className="mt-12 space-y-3 sm:grid grid-cols-3 gap-2">
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
          className="w-full font-medium text-base h-11 sm:h-12"
          onClick={() => router.back()}
          // variant="ghost"
          variant="secondary"
          size="lg"
        >
          취소
        </Button>
      </div>

      {/* 최근 수정일 */}
      {/* <div className="text-center text-sm font-medium mb-3 px-2 text-gray-600">
        최근 수정일:{" "}
        {data.updatedAt.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div> */}
    </form>
  );
};

export default NewForm;
