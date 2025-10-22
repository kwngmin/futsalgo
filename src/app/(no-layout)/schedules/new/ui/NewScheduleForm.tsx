"use client";

import { Label } from "@/shared/components/ui/label";
import {
  Blend,
  CalendarIcon,
  Check,
  ChevronDownIcon,
  Loader2,
  Mars,
  Venus,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
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
import { getPeriodFromHour } from "../lib/schedule-period";
import { getDayOfWeekFromDate } from "../lib/day-of-week-mapper";
import { TEAM_GENDER } from "@/entities/team/model/constants";
import { formatCityName } from "@/entities/team/lib/format-city-name";
import Image from "next/image";
import { cityData } from "@/features/search-address-sgis/constants";
import { useDistricts } from "@/app/(main-layout)/schedules/lib/use-districts";
import { Textarea } from "@/shared/components/ui/textarea";

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
    teamShareFee: z.number().min(0).max(999999).optional(),
    message: z.string().optional(),
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

// 날짜 관련 유틸리티 함수들 - DRY 원칙
const dateUtils = {
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

  formatDateString: (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
};

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

  const [selectedCity, setSelectedCity] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>();
  // 주최팀 정보가 초기 설정되었는지 추적하는 플래그
  const [isHostTeamInitialized, setIsHostTeamInitialized] = useState(false);

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
      // 도시 변경 시 구/군 선택 초기화
      setSelectedDistrict(undefined);
    },
    []
  );

  const handleDistrictChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedDistrict(e.target.value);
    },
    []
  );

  // 참석여부 투표 표시 여부 결정 - 과거 날짜와 오늘은 표시하지 않음
  const shouldShowAttendanceVote = () => {
    if (!matchDate) return false;
    return (
      !dateUtils.isPastDate(matchDate) &&
      !dateUtils.isToday(matchDate) &&
      !dateUtils.isTomorrow(matchDate)
    ); // 내일 이후 날짜에만 표시
  };

  // 동적 경기구분 옵션 생성
  const getMatchTypeOptions = () => {
    const baseOptions = [{ label: "자체전", value: "SQUAD" }];

    // 과거 날짜가 아닌 경우에만 친선전 추가
    if (!matchDate || !dateUtils.isPastDate(matchDate)) {
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
    resetField,
  } = useForm<NewFormData>({
    resolver: zodResolver(newFormSchema),
    defaultValues: {
      matchType: "SQUAD",
      enableAttendanceVote: false,
      hostTeamId: teams.length === 1 ? teams[0].team.id : "",
      teamShareFee: 0,
    },
  });

  const hostTeamId = watch("hostTeamId");
  const matchType = watch("matchType");

  const { teamCode, onChange, resetValidation } =
    useTeamCodeValidation(hostTeamId);

  // 주최팀 정보 가져오기 - 메모이제이션으로 최적화
  const hostTeamInfo = useMemo(() => {
    if (!hostTeamId) return null;
    return teams.find((t) => t.team.id === hostTeamId)?.team;
  }, [hostTeamId, teams]);

  // 주최팀이 변경될 때만 초기 설정 (한 번만 실행)
  useEffect(() => {
    if (hostTeamInfo && !isHostTeamInitialized) {
      setSelectedCity(hostTeamInfo.city);
      setSelectedDistrict(hostTeamInfo.district);
      setIsHostTeamInitialized(true);
    } else if (!hostTeamInfo && isHostTeamInitialized) {
      // 주최팀이 없어지면 초기화
      setSelectedCity(undefined);
      setSelectedDistrict(undefined);
      setIsHostTeamInitialized(false);
    }
  }, [hostTeamInfo, isHostTeamInitialized]);

  // 주최팀이 변경되면 초기화 플래그를 리셋
  useEffect(() => {
    setIsHostTeamInitialized(false);
  }, [hostTeamId]);

  // 날짜 변경 시 로직 처리
  useEffect(() => {
    if (!matchDate) return;

    // 과거 날짜이거나 오늘 선택 시
    if (dateUtils.isPastDate(matchDate) || dateUtils.isToday(matchDate)) {
      // 1. 과거 날짜에서 친선전이 선택되어 있다면 자체전으로 변경
      if (dateUtils.isPastDate(matchDate) && matchType === "TEAM") {
        setValue("matchType", "SQUAD");
      }

      // 2. 참석여부 투표 비활성화 (과거 날짜 + 오늘)
      setValue("enableAttendanceVote", false);
      setValue("attendanceDeadline", undefined);
      setDeadlineDate(undefined);
    }
  }, [matchDate, setValue, matchType]);

  // 경기구분 변경 시 처리
  useEffect(() => {
    if (matchType === "SQUAD") {
      // 자체전 선택 시 invitedTeamId 초기화
      setValue("invitedTeamId", undefined);
    } else if (matchType === "TEAM") {
      // 친선전 선택 시 과거 날짜가 선택되어 있다면 날짜 초기화
      if (matchDate && dateUtils.isPastDate(matchDate)) {
        setMatchDate(undefined);
        setValue("date", "");
      }
    }
  }, [matchType, matchDate, setValue]);

  // 팀 코드가 유효할 때 invitedTeamId 설정
  useEffect(() => {
    if (teamCode.status === "valid" && teamCode.team?.id) {
      setValue("invitedTeamId", teamCode.team.id);
    } else {
      // 유효하지 않거나 자체전인 경우 undefined로 설정
      setValue("invitedTeamId", undefined);
    }
  }, [teamCode.status, teamCode.team?.id, setValue]);

  // 캘린더 disabled 로직 재사용을 위한 함수
  const getDeadlineDisabledDates = useCallback(
    (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (matchDate) {
        // 내일 경기면 오늘만 선택 가능
        if (dateUtils.isTomorrow(matchDate)) {
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
    },
    [matchDate]
  );

  const onSubmit = async (formData: NewFormData) => {
    setIsLoading(true);

    try {
      // 한국 시간 기준으로 Period 계산
      const [hour] = formData.startTime.split(":").map(Number);
      const startPeriod = getPeriodFromHour(hour);
      const dayOfWeek = getDayOfWeekFromDate(formData.date);

      const result = await addNewSchedule({
        createdById: userId,
        formData: {
          ...formData,
          startPeriod,
          year: new Date(formData.date).getFullYear(),
          dayOfWeek,
          city: selectedCity,
          district: selectedDistrict,
        },
      });

      if (result.success) {
        alert("일정이 추가되었습니다.");
        // 쿼리 무효화를 병렬로 처리하여 성능 향상
        queryClient.invalidateQueries({
          queryKey: ["schedules"],
        });
        queryClient.invalidateQueries({
          queryKey: ["my-schedules"],
        });
        router.replace(`/`);
        router.refresh();
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

  // 팀 정보 표시 컴포넌트 - DRY 원칙
  const TeamInfoDisplay = ({ team }: { team: typeof teamCode.team }) => {
    if (!team) return null;

    return (
      <div className="p-3 bg-gray-100 rounded-md flex items-center gap-2">
        {/* 팀 로고 */}
        <div className="size-10 rounded-lg flex items-center justify-center text-[1.625rem] flex-shrink-0">
          {team.logoUrl ? (
            <Image src={team.logoUrl} alt={team.name} width={40} height={40} />
          ) : (
            <div className="size-10 bg-gradient-to-br from-slate-300 to-gray-100 rounded-full flex items-center justify-center text-xl text-slate-700 flex-shrink-0">
              {team.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-700">
          <div className="font-semibold">{team.name}</div>
          <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-3">
            <div className="text-sm mb-0.5 w-full tracking-tight flex items-center gap-1 text-muted-foreground font-medium">
              {team.gender === "MALE" ? (
                <Mars className="size-4 text-sky-700" />
              ) : team.gender === "FEMALE" ? (
                <Venus className="size-4 text-pink-700" />
              ) : (
                <Blend className="size-4 text-gray-700" />
              )}
              {`${TEAM_GENDER[team.gender as keyof typeof TEAM_GENDER]}`}
              {` • ${`${formatCityName(team.city)} ${team.district}`}`}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 투표 마감일자 캘린더 컴포넌트 - DRY 원칙
  const DeadlineCalendar = ({
    isMobile = false,
    onSelect,
  }: {
    isMobile?: boolean;
    onSelect?: (date: Date | undefined) => void;
  }) => {
    const handleSelect = (date: Date | undefined) => {
      if (!date) return;
      setValue("attendanceDeadline", dateUtils.formatDateString(date));
      setDeadlineDate(date);
      if (onSelect) onSelect(date);
    };

    return (
      <Calendar
        mode="single"
        selected={deadlineDate}
        className={`rounded-md border ${
          isMobile ? "pb-12 sm:pb-6" : ""
        } w-full [--cell-size:--spacing(11.75)] sm:[--cell-size:--spacing(10)] mx-auto ${
          !matchDate ? "opacity-50 pointer-events-none" : ""
        }`}
        disabled={getDeadlineDisabledDates}
        locale={ko}
        onSelect={handleSelect}
      />
    );
  };

  console.log(errors);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 px-4 py-2 bg-white rounded-2xl"
    >
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col gap-6 grow">
          {/* 주최팀 */}
          <div className="space-y-2">
            <Label className="px-1">주최팀</Label>
            <CustomSelect
              size="sm"
              placeholder="선택"
              options={teams.map((t) => (
                <option key={t.team.id} value={t.team.id}>
                  {t.team.name}
                </option>
              ))}
              value={hostTeamId}
              onChange={(e) => setValue("hostTeamId", e.target.value)}
              disabled={teams.length === 1}
            />
          </div>

          {/* 경기 구분 */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="px-1">경기 구분</Label>
              <div className="space-y-2">
                <CustomRadioGroup
                  options={getMatchTypeOptions()}
                  value={matchType}
                  onValueChange={(value) => {
                    setValue("matchType", value as "TEAM" | "SQUAD");
                    if (value === "SQUAD") {
                      resetField("invitedTeamId");
                      resetValidation();
                    }
                  }}
                  error={errors.matchType?.message}
                />
              </div>
              {/* 과거 날짜 선택 시 친선전 비활성화 안내 */}
              {matchDate && dateUtils.isPastDate(matchDate) && (
                <div className="text-sm text-muted-foreground px-1">
                  과거 날짜는 자체전만 선택 가능합니다
                </div>
              )}
            </div>

            {/* 팀 코드 입력 - 친선전일 때만 */}
            {matchType === "TEAM" && (
              <div className="space-y-2">
                <Label htmlFor="invited-team-code">
                  초청팀 코드 - 6자리 숫자
                </Label>
                <div className="relative">
                  <Input
                    id="invited-team-code"
                    type="text"
                    value={teamCode.value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="예) 123456"
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
                    // variant={
                    //   teamCode.duplicateMembers ? "warning" : "destructive"
                    // }
                    variant="destructive"
                    className={
                      teamCode.duplicateMembers
                        ? "bg-orange-50 border-orange-200"
                        : "bg-destructive/5 border-none"
                    }
                  >
                    <AlertDescription>
                      {teamCode.error}

                      {/* 중복 멤버가 많은 경우 상세 리스트 표시 (선택사항) */}
                      {teamCode.duplicateMembers &&
                        teamCode.duplicateMembers.length > 3 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm font-medium">
                              중복 멤버 전체 보기
                            </summary>
                            <ul className="mt-1 text-sm space-y-0.5">
                              {teamCode.duplicateMembers.map((name, index) => (
                                <li key={index} className="ml-4">
                                  • {name}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* 초청팀 정보 표시 */}
                {teamCode.status === "valid" && teamCode.team && (
                  <TeamInfoDisplay team={teamCode.team} />
                )}
              </div>
            )}
          </div>

          {/* 풋살장 */}
          <div className="space-y-2">
            <Label className="">풋살장</Label>
            <Input
              type="text"
              placeholder="풋살장을 입력하세요"
              {...register("place")}
            />
          </div>

          {/* 위치 */}
          <div className="space-y-2">
            <Label className="px-1">위치</Label>
            <div className="grid grid-cols-2 gap-1 shrink-0">
              <CustomSelect
                key={`city-${selectedCity}`}
                placeholder="시도 선택"
                className="min-w-32 shrink-0"
                size="sm"
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
                size="sm"
                options={districtOptions}
                value={selectedDistrict || ""}
                onChange={handleDistrictChange}
                aria-label="시군구 선택"
              />
            </div>
          </div>
        </div>

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
                if (matchType === "TEAM") {
                  return dateUtils.isPastDate(date);
                }
                return false; // 자체전은 모든 날짜 허용
              }}
              onSelect={(date) => {
                if (!date) return;
                setValue("date", dateUtils.formatDateString(date));
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
      </div>

      {matchType === "TEAM" && teamCode.status === "valid" && (
        <div className="space-y-6">
          {/* 메시지 */}
          <div className="space-y-2">
            <Label className="">메시지</Label>
            <Textarea
              {...register("description")}
              className="min-h-24"
              placeholder="초청팀에게 전달 할 메시지를 작성해주세요"
            />
          </div>

          {/* 비용 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="invited-team-code">시설 이용료 분담금</Label>
              <div className="relative">
                <Input
                  id="invited-team-code"
                  type="number"
                  {...register("teamShareFee", {
                    valueAsNumber: true,
                    onChange: (e) => {
                      if (Number(e.target.value)) {
                        setValue("teamShareFee", e.target.valueAsNumber);
                      }
                    },
                  })}
                  className="pr-8"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  원
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 참석여부 투표 - 과거 날짜가 아닌 경우에만 표시 */}
      {shouldShowAttendanceVote() && (
        <div className="flex flex-col sm:flex-row gap-y-6 gap-x-2">
          <div className="space-y-2">
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
                <div className="flex flex-col gap-2 max-w-64">
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
                      <DeadlineCalendar onSelect={() => setOpen(false)} />
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
                  <DeadlineCalendar isMobile={true} />
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
      <div className="mt-12 space-y-2 sm:grid grid-cols-3 gap-2">
        <Button
          type="submit"
          disabled={
            isLoading ||
            !matchDate ||
            (matchType === "TEAM" && teamCode.status !== "valid")
          }
          className="w-full font-semibold text-base disabled:opacity-50 disabled:pointer-events-none"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              만들기 중...
            </>
          ) : (
            "만들기"
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
