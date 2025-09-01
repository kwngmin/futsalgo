"use client";

import { Label } from "@/shared/components/ui/label";
import { CalendarIcon, ChevronDownIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { Calendar } from "@/shared/components/ui/calendar";
import { useRouter } from "next/navigation";
import { ko } from "date-fns/locale";
import { TeamWithBasicInfo } from "@/features/add-schedule/model/actions/get-my-teams";
import CustomSelect from "@/shared/components/ui/custom-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

const editFormSchema = z
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

export type EditFormData = z.infer<typeof editFormSchema>;

// 기존 일정 데이터 타입
export interface ExistingSchedule {
  id: string;
  place: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  matchType: "SQUAD" | "TEAM";
  city?: string;
  district?: string;
  enableAttendanceVote: boolean;
  attendanceDeadline?: string; // YYYY-MM-DD
  hostTeamId: string;
  invitedTeamId?: string;
  invitedTeam?: {
    id: string;
    name: string;
    city: string;
    district: string;
    level: string;
  };
}

const EditScheduleForm = ({
  teams,
  userId,
  existingSchedule,
  onUpdate,
  onDelete,
}: {
  teams: TeamWithBasicInfo[];
  userId: string;
  existingSchedule: ExistingSchedule;
  onUpdate: (formData: EditFormData) => Promise<void>;
  onDelete: () => Promise<void>;
}) => {
  console.log(userId, "userId");
  console.log(existingSchedule, "existingSchedule");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<EditFormData | null>(
    null
  );
  const [confirmMessage, setConfirmMessage] = useState("");

  // 원본 데이터 저장
  const [originalData] = useState(existingSchedule);

  // 초기 날짜 설정 - useMemo로 최적화
  const initialMatchDate = useMemo(() => {
    if (existingSchedule.date) {
      return new Date(existingSchedule.date);
    }
    return undefined;
  }, [existingSchedule.date]);

  const initialDeadlineDate = useMemo(() => {
    if (existingSchedule.attendanceDeadline) {
      return new Date(existingSchedule.attendanceDeadline);
    }
    return undefined;
  }, [existingSchedule.attendanceDeadline]);

  const [matchDate, setMatchDate] = useState<Date | undefined>(
    initialMatchDate
  );
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(
    initialDeadlineDate
  );

  // defaultValues를 포함한 useForm 초기화
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    // reset,
  } = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      hostTeamId: existingSchedule.hostTeamId,
      invitedTeamId: existingSchedule.invitedTeamId || undefined,
      place: existingSchedule.place,
      description: existingSchedule.description || "",
      date: existingSchedule.date,
      startTime: existingSchedule.startTime,
      endTime: existingSchedule.endTime,
      matchType: existingSchedule.matchType,
      city: existingSchedule.city || undefined,
      district: existingSchedule.district || undefined,
      enableAttendanceVote: existingSchedule.enableAttendanceVote,
      attendanceDeadline: existingSchedule.attendanceDeadline || undefined,
    },
  });

  // 날짜 관련 헬퍼 함수들
  const dateHelpers = useMemo(
    () => ({
      isPastDate: (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
      },
      isToday: (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate.getTime() === today.getTime();
      },
      isTomorrow: (date: Date) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate.getTime() === tomorrow.getTime();
      },
    }),
    []
  );

  const shouldShowAttendanceVote = () => {
    if (!matchDate) return false;
    return (
      !dateHelpers.isPastDate(matchDate) && !dateHelpers.isToday(matchDate)
    );
  };

  const getMatchTypeOptions = () => {
    const baseOptions = [{ label: "자체전", value: "SQUAD" }];

    if (!matchDate || !dateHelpers.isPastDate(matchDate)) {
      baseOptions.push({ label: "친선전", value: "TEAM" });
    }

    return baseOptions;
  };

  // 변경사항 감지 함수
  const detectChanges = (formData: EditFormData) => {
    const changes = {
      isMatchTypeChanged: originalData.matchType !== formData.matchType,
      isDateChanged: originalData.date !== formData.date,
      isTimeChanged:
        originalData.startTime !== formData.startTime ||
        originalData.endTime !== formData.endTime,
      wasTeamMatch: originalData.matchType === "TEAM",
      willBeTeamMatch: formData.matchType === "TEAM",
    };

    return changes;
  };

  // 확인 메시지 생성
  const getConfirmMessage = (changes: ReturnType<typeof detectChanges>) => {
    if (changes.wasTeamMatch && !changes.willBeTeamMatch) {
      return "친선전을 자체전으로 변경하면 기존 일정이 삭제되고 새로운 일정이 생성됩니다. 계속하시겠습니까?";
    }

    if (
      changes.wasTeamMatch &&
      (changes.isDateChanged || changes.isTimeChanged)
    ) {
      return "친선전의 날짜나 시간을 변경하면 기존 일정이 삭제되고 새로운 일정이 생성됩니다. 계속하시겠습니까?";
    }

    if (!changes.wasTeamMatch && changes.willBeTeamMatch) {
      return "자체전을 친선전으로 변경하면 다시 자체전으로 되돌릴 수 없습니다. 계속하시겠습니까?";
    }

    return "변경사항을 저장하시겠습니까?";
  };

  // 확인이 필요한 변경인지 체크
  const needsConfirmation = (changes: ReturnType<typeof detectChanges>) => {
    return (
      (changes.wasTeamMatch && !changes.willBeTeamMatch) ||
      (changes.wasTeamMatch &&
        (changes.isDateChanged || changes.isTimeChanged)) ||
      (!changes.wasTeamMatch && changes.willBeTeamMatch)
    );
  };

  // 날짜 변경 시 로직 처리
  useEffect(() => {
    if (!matchDate) return;

    if (dateHelpers.isPastDate(matchDate) || dateHelpers.isToday(matchDate)) {
      if (dateHelpers.isPastDate(matchDate) && watch("matchType") === "TEAM") {
        setValue("matchType", "SQUAD");
      }

      setValue("enableAttendanceVote", false);
      setValue("attendanceDeadline", undefined);
      setDeadlineDate(undefined);
    }
  }, [matchDate, setValue, watch, dateHelpers]);

  // 경기구분 변경 시 처리
  useEffect(() => {
    const currentMatchType = watch("matchType");

    if (currentMatchType === "SQUAD") {
      setValue("invitedTeamId", undefined);
    } else if (currentMatchType === "TEAM") {
      if (matchDate && dateHelpers.isPastDate(matchDate)) {
        setMatchDate(undefined);
        setValue("date", "");
      }
    }
  }, [watch("matchType"), matchDate, setValue, dateHelpers]);

  const handleFormSubmit = async (formData: EditFormData) => {
    const changes = detectChanges(formData);

    if (needsConfirmation(changes)) {
      setConfirmMessage(getConfirmMessage(changes));
      setPendingFormData(formData);
      setShowConfirmDialog(true);
      return;
    }

    await executeUpdate(formData);
  };

  const executeUpdate = async (formData: EditFormData) => {
    setIsLoading(true);

    try {
      await onUpdate(formData);
      alert("일정이 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      router.back();
    } catch (error) {
      console.error("일정 수정 실패:", error);

      const errorMessage =
        error instanceof Error ? error.message : "일정 수정에 실패했습니다.";

      if (errorMessage.includes("권한이 없습니다")) {
        setError("root", { message: "일정을 수정할 권한이 없습니다." });
      } else if (errorMessage.includes("로그인이 필요합니다")) {
        setError("root", { message: "로그인이 필요합니다." });
      } else {
        setError("root", {
          message: "일정 수정 중 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
      setPendingFormData(null);
    }
  };

  const handleConfirmUpdate = async () => {
    if (pendingFormData) {
      await executeUpdate(pendingFormData);
    }
  };

  const handleDeleteSchedule = async () => {
    if (confirm("정말로 이 일정을 삭제하시겠습니까?")) {
      setIsLoading(true);
      try {
        await onDelete();
        alert("일정이 삭제되었습니다.");
        queryClient.invalidateQueries({ queryKey: ["schedules"] });
        router.replace("/");
      } catch (error) {
        console.error("일정 삭제 실패:", error);
        alert("일정 삭제에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 폼 JSX는 기존과 동일...
  return (
    <>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6 px-4 py-2 bg-white rounded-2xl"
      >
        {/* 기존 폼 내용 그대로 유지 */}
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
                  if (watch("matchType") === "TEAM") {
                    return dateHelpers.isPastDate(date);
                  }
                  return false;
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
                  {...register("startTime")}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none min-w-32 text-sm"
                />
                -
                <Input
                  type="time"
                  id="end-time"
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
                {matchDate && dateHelpers.isPastDate(matchDate) && (
                  <div className="text-sm text-muted-foreground px-1">
                    과거 날짜는 자체전만 선택 가능합니다
                  </div>
                )}
              </div>
            </div>

            {/* 초청팀 정보 표시 - 친선전일 때만 (수정 불가) */}
            {watch("matchType") === "TEAM" && existingSchedule.invitedTeam && (
              <div className="space-y-3">
                <Label>초청팀</Label>
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-medium text-gray-800">
                    {existingSchedule.invitedTeam.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {existingSchedule.invitedTeam.city}{" "}
                    {existingSchedule.invitedTeam.district} ·{" "}
                    {existingSchedule.invitedTeam.level} 레벨
                  </div>
                  <div className="text-xs text-orange-600 mt-2">
                    초청팀은 수정할 수 없습니다. 변경하려면 일정을 삭제하고 다시
                    만들어주세요.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 시설 이용안내 */}
        <div className="space-y-3">
          <Label className="">시설 이용안내</Label>
          <Textarea
            {...register("description")}
            className="min-h-24"
            placeholder="시설 이용안내를 작성해주세요"
          />
        </div>

        {/* 참석여부 투표 */}
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
                              if (dateHelpers.isTomorrow(matchDate)) {
                                const compareDate = new Date(date);
                                compareDate.setHours(0, 0, 0, 0);
                                return (
                                  compareDate.getTime() !== today.getTime()
                                );
                              }

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
                              `${year}-${String(
                                dateData.getMonth() + 1
                              ).padStart(2, "0")}-${String(
                                dateData.getDate()
                              ).padStart(2, "0")}`
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
                          if (dateHelpers.isTomorrow(matchDate)) {
                            const compareDate = new Date(date);
                            compareDate.setHours(0, 0, 0, 0);
                            return compareDate.getTime() !== today.getTime();
                          }

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
            disabled={isLoading || !matchDate}
            className="w-full font-semibold text-base disabled:opacity-50 disabled:pointer-events-none"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "수정"
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

          <Button
            type="button"
            disabled={isLoading}
            className="w-full font-medium text-base h-11 sm:h-12"
            onClick={handleDeleteSchedule}
            variant="destructive"
            size="lg"
          >
            삭제
          </Button>
        </div>
      </form>

      {/* 확인 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>변경사항 확인</DialogTitle>
            <DialogDescription>{confirmMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setPendingFormData(null);
              }}
              disabled={isLoading}
            >
              아니요
            </Button>
            <Button onClick={handleConfirmUpdate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  수정 중...
                </>
              ) : (
                "예"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditScheduleForm;
