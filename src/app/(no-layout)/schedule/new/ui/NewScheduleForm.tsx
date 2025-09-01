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
// import { Textarea } from "@/shared/components/ui/textarea";
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
import { useTeamCodeValidation } from "../lib/use-team-code-validation";
import { useQueryClient } from "@tanstack/react-query";

const newFormSchema = z
  .object({
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
    attendanceDeadline: z.string().optional(),
  })
  .refine(
    (data) => {
      // 참석여부 투표를 사용하는 경우에만 attendanceDeadline 필수
      if (data.enableAttendanceVote) {
        return data.attendanceDeadline && data.attendanceDeadline.length > 0;
      }
      return true;
    },
    {
      message: "참석여부 투표를 사용하는 경우 마감일자를 선택해주세요",
      path: ["attendanceDeadline"],
    }
  );

export type NewFormData = z.infer<typeof newFormSchema>;

const NewScheduleForm = ({
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

  // 날짜 관련 헬퍼 함수들
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === tomorrow.getTime();
  };

  // 참석여부 투표 표시 여부 결정 - 과거 날짜와 오늘은 표시하지 않음
  const shouldShowAttendanceVote = () => {
    if (!matchDate) return false;
    return !isPastDate(matchDate) && !isToday(matchDate); // 내일 이후 날짜에만 표시
  };

  // 동적 경기구분 옵션 생성
  const getMatchTypeOptions = () => {
    const baseOptions = [{ label: "자체전", value: "SQUAD" }];

    // 과거 날짜가 아닌 경우에만 친선전 추가
    if (!matchDate || !isPastDate(matchDate)) {
      baseOptions.push({ label: "친선전", value: "TEAM" });
    }

    return baseOptions;
  };

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

  // 날짜 변경 시 로직 처리
  useEffect(() => {
    if (!matchDate) return;

    // 과거 날짜이거나 오늘 선택 시
    if (isPastDate(matchDate) || isToday(matchDate)) {
      // 1. 과거 날짜에서 친선전이 선택되어 있다면 자체전으로 변경
      if (isPastDate(matchDate) && watch("matchType") === "TEAM") {
        setValue("matchType", "SQUAD");
      }

      // 2. 참석여부 투표 비활성화 (과거 날짜 + 오늘)
      setValue("enableAttendanceVote", false);
      setValue("attendanceDeadline", undefined);
      setDeadlineDate(undefined);
    }
  }, [matchDate, setValue, watch]);

  // 경기구분 변경 시 처리
  useEffect(() => {
    const currentMatchType = watch("matchType");

    if (currentMatchType === "SQUAD") {
      // 자체전 선택 시 invitedTeamId 초기화
      setValue("invitedTeamId", undefined);
    } else if (currentMatchType === "TEAM") {
      // 친선전 선택 시 과거 날짜가 선택되어 있다면 날짜 초기화
      if (matchDate && isPastDate(matchDate)) {
        setMatchDate(undefined);
        setValue("date", "");
      }
    }
  }, [watch("matchType"), matchDate, setValue]);

  // 팀 코드가 유효할 때 invitedTeamId 설정
  useEffect(() => {
    if (teamCode.status === "valid" && teamCode.team?.id) {
      setValue("invitedTeamId", teamCode.team.id);
    } else {
      // 유효하지 않거나 자체전인 경우 undefined로 설정
      setValue("invitedTeamId", undefined);
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
          {/* 날짜 선택 */}
          <div className="flex flex-col gap-3 pb-3 sm:pb-0">
            <Label htmlFor="match-date-picker" className="px-1">
              날짜
            </Label>
            <Calendar
              mode="single"
              selected={matchDate}
              className="rounded-md border pb-12 sm:pb-7 w-full [--cell-size:--spacing(11.75)] sm:[--cell-size:--spacing(10)] mx-auto shadow-xs"
              locale={ko}
              disabled={(date) => {
                // 친선전 선택 시 과거 날짜 비활성화
                if (watch("matchType") === "TEAM") {
                  return isPastDate(date);
                }
                return false; // 자체전은 모든 날짜 허용
              }}
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

          {/* 시간 선택 */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="start-time" className="px-1">
              시작 시간 - 종료 시간
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                id="start-time"
                defaultValue="06:00"
                {...register("startTime")}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none min-w-32 text-sm"
              />
              -
              <Input
                type="time"
                id="end-time"
                defaultValue="08:00"
                {...register("endTime")}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none min-w-32 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 grow">
          {/* 풋살장 */}
          <div className="space-y-3">
            <Label className="">풋살장</Label>
            <Input
              type="text"
              placeholder="풋살장을 입력하세요"
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

          {/* 경기 구분 */}
          <div className="space-y-3">
            <Label className="px-1">경기 구분</Label>
            <div className="space-y-2">
              <CustomRadioGroup
                options={getMatchTypeOptions()}
                value={watch("matchType")}
                onValueChange={(value) =>
                  setValue("matchType", value as "TEAM" | "SQUAD")
                }
                error={errors.matchType?.message}
                direction="vertical"
              />
              {/* 과거 날짜 선택 시 친선전 비활성화 안내 */}
              {matchDate && isPastDate(matchDate) && (
                <div className="text-sm text-muted-foreground px-1">
                  과거 날짜는 자체전만 선택 가능합니다
                </div>
              )}
            </div>
          </div>

          {/* 팀 코드 입력 - 친선전일 때만 */}
          {watch("matchType") === "TEAM" && (
            <div className="space-y-3">
              <Label htmlFor="invited-team-code">초청팀 코드</Label>
              <div className="relative">
                <Input
                  id="invited-team-code"
                  type="text"
                  value={teamCode.value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="초청팀 코드를 입력하세요"
                  maxLength={6}
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

          {/* 초청팀 정보 표시 */}
          {teamCode.status === "valid" && teamCode.team && (
            <div className="space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-800">
                초청팀 정보
              </div>
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

      {/* 공지사항 */}
      {/* <div className="space-y-3">
        <Label className="">공지사항</Label>
        <Textarea
          {...register("description")}
          className="min-h-24"
          placeholder="공지사항을 작성해주세요"
        />
      </div> */}

      {/* 참석여부 투표 - 과거 날짜가 아닌 경우에만 표시 */}
      {shouldShowAttendanceVote() && (
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
                onClick={() => {
                  setValue("enableAttendanceVote", false);
                  setValue("attendanceDeadline", undefined);
                  setDeadlineDate(undefined);
                }}
              >
                사용 안 함
              </button>
            </div>
          </div>

          {watch("enableAttendanceVote") && (
            <>
              {/* 데스크톱 버전 - 투표 마감일자 */}
              <div className="hidden sm:block">
                <div className="flex flex-col gap-3 max-w-64">
                  <Label htmlFor="deadline-date-picker" className="px-1">
                    투표 마감일자 (자정 마감)
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
                            // 내일 경기면 오늘만 선택 가능
                            if (isTomorrow(matchDate)) {
                              const compareDate = new Date(date);
                              compareDate.setHours(0, 0, 0, 0);
                              return compareDate.getTime() !== today.getTime();
                            }

                            // 그 외의 경우 경기 전날까지 선택 가능
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
              </div>

              {/* 모바일 버전 - 투표 마감일자 */}
              <div className="flex flex-col gap-6 sm:hidden">
                <div className="flex flex-col gap-3 pb-3 sm:pb-0">
                  <Label htmlFor="mobile-deadline-picker" className="px-1">
                    투표 마감일자 (자정 마감)
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
                        // 내일 경기면 오늘만 선택 가능
                        if (isTomorrow(matchDate)) {
                          const compareDate = new Date(date);
                          compareDate.setHours(0, 0, 0, 0);
                          return compareDate.getTime() !== today.getTime();
                        }

                        // 그 외의 경우 경기 전날까지 선택 가능
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
              </div>
            </>
          )}
        </div>
      )}

      {/* 오류 메시지 */}
      {errors.root && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      {/* 버튼들 */}
      <div className="mt-12 space-y-3 sm:grid grid-cols-3 gap-2">
        <Button
          type="submit"
          disabled={
            isLoading ||
            !matchDate ||
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

export default NewScheduleForm;
