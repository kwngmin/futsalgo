"use client";

import { Label } from "@/shared/components/ui/label";
import { CalendarIcon, Check, ChevronDownIcon, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import { Textarea } from "@/shared/components/ui/textarea";
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
import { MATCH_TYPE_OPTIONS } from "@/entities/schedule/model/constants";
import { useQueryClient } from "@tanstack/react-query";
import { useTeamCodeValidation } from "../lib/use-team-code-validation";

const newFormSchema = z.object({
  hostTeamId: z.string().min(1),
  invitedTeamId: z.string().optional(),
  place: z.string().min(1),
  description: z.string().optional(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  matchType: z.string().min(1),
  city: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  enableAttendanceVote: z.boolean(),
  attendanceDeadline: z.string().min(1).optional(),
  attendanceEndTime: z.string().min(1).optional(),
});

export type NewFormData = z.infer<typeof newFormSchema>;

const NewForm = ({
  teams,
  userId,
}: {
  teams: TeamWithBasicInfo[];
  userId: string;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [matchDate, setMatchDate] = useState<Date>();
  const [deadlineDate, setDeadlineDate] = useState<Date>();
  const queryClient = useQueryClient();

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
      enableAttendanceVote: false,
      hostTeamId: teams.length === 1 ? teams[0].team.id : "",
    },
  });

  // 팀 코드가 유효할 때 invitedTeamId 설정
  useEffect(() => {
    if (teamCode.status === "valid" && teamCode.team?.id) {
      setValue("invitedTeamId", teamCode.team.id);
    } else {
      setValue("invitedTeamId", "");
    }
  }, [teamCode.status, teamCode.team?.id, setValue]);

  const onSubmit = async (formData: NewFormData) => {
    setIsLoading(true);

    try {
      const result = await addNewSchedule({
        createdById: userId,
        formData,
      });

      if (result.success) {
        alert("일정이 추가되었습니다.");
        queryClient.invalidateQueries({ queryKey: ["schedules"] });
        router.replace(`/`);
      }
    } catch (error) {
      console.error("일정 추가 실패:", error);

      const errorMessage =
        error instanceof Error ? error.message : "일정 추가에 실패했습니다.";

      if (errorMessage.includes("권한이 없습니다")) {
        setError("root", { message: "일정을 추가할 권한이 없습니다." });
      } else if (errorMessage.includes("로그인이 필요합니다")) {
        setError("root", { message: "로그인이 필요합니다." });
      } else {
        setError("root", {
          message: "일정 추가 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
              locale={ko}
              onSelect={(date) => {
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

          <div className="flex flex-col gap-3">
            <Label htmlFor="time-picker" className="px-1">
              시작 시간 - 종료 시간
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
                defaultValue="08:00"
                {...register("endTime")}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none min-w-32 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 grow">
          <div className="space-y-3">
            <Label className="">장소</Label>
            <Input
              type="text"
              placeholder="장소를 입력하세요"
              {...register("place")}
            />
          </div>

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

          {/* 팀 코드 입력 - 간소화된 로직 */}
          {watch("matchType") === "TEAM" && (
            <div className="space-y-3">
              <Label htmlFor="invitedTeamCode">초청팀 코드</Label>
              <div className="relative">
                <Input
                  id="invitedTeamCode"
                  type="text"
                  value={teamCode.value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="초청팀 코드를 입력하세요"
                />
                {teamCode.status === "checking" && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                )}
                {teamCode.status === "valid" && (
                  <Check className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                )}
                {teamCode.status === "invalid" && (
                  <X className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" />
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

          {/* 초청팀 정보 표시 - 간소화된 로직 */}
          {teamCode.status === "valid" && teamCode.team && (
            <div className="space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-700">
                <div>
                  <strong>{teamCode.team.name}</strong>
                </div>
                <div className="text-xs text-green-600">
                  {teamCode.team.city} {teamCode.team.district} ·{" "}
                  {teamCode.team.level} 레벨
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="">공지사항</Label>
        <Textarea
          {...register("description")}
          className="min-h-24"
          placeholder="공지사항을 작성해주세요"
        />
      </div>

      {/* 참석여부 투표 */}
      {matchDate && matchDate >= new Date() && (
        <div className="flex flex-col sm:flex-row gap-y-6 gap-x-2">
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
                <Label htmlFor="deadline-date-picker" className="px-1">
                  투표 종료 일자
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="deadline-date-picker"
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
                        today.setHours(0, 0, 0, 0);

                        if (matchDate) {
                          const match = new Date(matchDate);
                          match.setDate(match.getDate() - 1);
                          match.setHours(23, 59, 59, 999);
                          return date < today || date > match;
                        }

                        return date < today;
                      }}
                      onSelect={(date) => {
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
                <Label htmlFor="attendance-end-time" className="px-1">
                  투표 종료 시간
                </Label>
                <Input
                  type="time"
                  id="attendance-end-time"
                  defaultValue="06:00"
                  {...register("attendanceEndTime")}
                  disabled={!matchDate}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none min-w-32 text-sm"
                />
              </div>
            </div>
          )}

          {watch("enableAttendanceVote") && (
            <div className="flex flex-col gap-6 sm:hidden">
              <div className="flex flex-col gap-3 pb-3 sm:pb-0">
                <Label htmlFor="mobile-deadline-picker" className="px-1">
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
                    today.setHours(0, 0, 0, 0);

                    if (matchDate) {
                      const match = new Date(matchDate);
                      match.setDate(match.getDate() - 1);
                      match.setHours(23, 59, 59, 999);
                      return date < today || date > match;
                    }

                    return date < today;
                  }}
                  locale={ko}
                  onSelect={(date) => {
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
              <div className="flex flex-col gap-3 w-1/2">
                <Label htmlFor="mobile-attendance-end-time" className="px-1">
                  투표 종료 시간
                </Label>
                <Input
                  type="time"
                  id="mobile-attendance-end-time"
                  defaultValue="06:00"
                  {...register("attendanceEndTime")}
                  disabled={!matchDate}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none min-w-32 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {errors.root && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      <div className="mt-12 space-y-3 sm:grid grid-cols-3 gap-2">
        <Button
          type="submit"
          disabled={
            isLoading ||
            (watch("matchType") === "TEAM" && teamCode.status !== "valid")
          }
          className="w-full font-semibold text-base disabled:opacity-50 disabled:pointer-events-none"
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

        <Button
          type="button"
          disabled={isLoading}
          className="w-full font-medium text-base h-11 sm:h-12"
          onClick={() => router.back()}
          variant="secondary"
          size="lg"
        >
          취소
        </Button>
      </div>
    </form>
  );
};

export default NewForm;
