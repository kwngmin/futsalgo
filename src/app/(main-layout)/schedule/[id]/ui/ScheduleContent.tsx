"use client";

import {
  ArrowLeft,
  Share,
  ChevronRight,
  Loader2,
  PlusIcon,
  ChevronUp,
  ChevronDown,
  SquareCheckBigIcon,
  Square,
  Edit3,
  Save,
  X,
  ClockIcon,
  Calendar,
  Info,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import ScheduleAttendance from "./ScheduleAttendance";
import {
  CalendarCheckIcon,
  CalendarXIcon,
  HourglassHighIcon,
  MegaphoneSimpleIcon,
  SoccerBallIcon,
} from "@phosphor-icons/react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import SchedulePhotosGallery from "./SchedulePhotosGallery";
import { MatchType } from "@prisma/client";
import ScheduleComments from "./ScheduleComments";
import ScheduleMvp from "./ScheduleMvp";
import { useSession } from "next-auth/react";
import { getSchedule } from "../actions/get-schedule";
import { Button } from "@/shared/components/ui/button";
import { addMatch } from "../actions/add-match";
import { deleteSchedule } from "../actions/delete-schedule";
import { updateScheduleNotice } from "../actions/update-schedule-notice";
import Image from "next/image";
import { updateAttendanceStatus } from "../actions/update-attendance-status";
import { Separator } from "@/shared/components/ui/separator";
import TeamSide from "@/app/(no-layout)/schedule/[id]/match/[matchId]/ui/TeamSide";
import { respondTeamInvitation } from "../actions/respond-team-invitation";
import { getMatchLineupCount } from "../lib/summary-versus";
import MatchStatsLeaderboard from "./MatchStatsLeaderboard";

/**
 * 시간 범위를 한국어 표기 형식으로 변환
 * @param start 시작 시간 (Date 객체)
 * @param end 종료 시간 (Date 객체)
 * @returns 변환된 시간 문자열 (예: "오전 6:00 - 8:00" 또는 "오전 11:00 - 오후 1:00")
 */
function formatTimeRange(date: string, start: string, end: string): string {
  const startOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    dayPeriod: "short", // 오전/오후
  };

  const endOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    dayPeriod: "short",
  };

  const startParts = new Intl.DateTimeFormat(
    "ko-KR",
    startOptions
  ).formatToParts(new Date(`${date} ${start}`));

  const endParts = new Intl.DateTimeFormat("ko-KR", endOptions).formatToParts(
    new Date(`${date} ${end}`)
  );

  const startPeriod =
    startParts.find((p) => p.type === "dayPeriod")?.value ?? "";
  const startTime = startParts
    .filter((p) => p.type !== "dayPeriod")
    .map((p) => p.value)
    .join("");

  const endPeriod = endParts.find((p) => p.type === "dayPeriod")?.value ?? "";
  const endTime = endParts
    .filter((p) => p.type !== "dayPeriod")
    .map((p) => p.value)
    .join("");

  if (startPeriod === endPeriod) {
    return `${startPeriod} ${startTime} - ${endTime}`;
  }
  return `${startPeriod} ${startTime} - ${endPeriod} ${endTime}`;
}

/**
 * @param date YYYY-MM-DD 형식의 날짜 문자열
 * @returns D-day 숫자 (예: D-3이면 3, 오늘이면 0, 지났으면 음수)
 */
export function calculateDday(date: Date): number {
  const today = new Date();
  const targetDate = new Date(date);

  // 시차 보정: 시간을 00:00:00으로 맞춰줌 (UTC 문제 방지)
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

const ScheduleContent = ({
  scheduleId,
  isLikedSchedule,
  startTime,
  matchType,
}: {
  scheduleId: string;
  isLikedSchedule?: boolean;
  startTime?: string;
  matchType?: MatchType;
}) => {
  console.log(isLikedSchedule, "isLikedSchedule");
  console.log(startTime, "startTime");
  console.log(matchType, "matchType");
  const router = useRouter();

  const searchParams = useSearchParams();
  console.log(searchParams, "searchParams");
  const tab = searchParams.get("tab");
  console.log(tab, "tab");

  const session = useSession();
  const currentUserId = session.data?.user?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => getSchedule(scheduleId),
    placeholderData: keepPreviousData,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const queryClient = useQueryClient();

  const [isNoticeOpen, setIsNoticeOpen] = useState(true);
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeContent, setNoticeContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [isRespondingInvitation, setIsRespondingInvitation] = useState(false);
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 데이터 로드 시 공지사항 내용 설정
  useEffect(() => {
    if (data?.data?.schedule?.description) {
      setNoticeContent(data.data.schedule.description);
    }
  }, [data?.data?.schedule?.description]);

  // 편집 모드 진입 시 textarea 포커스
  useEffect(() => {
    if (isEditingNotice && textareaRef.current) {
      textareaRef.current.focus();
      // 커서를 텍스트 끝으로 이동
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditingNotice]);

  const isAttendance = data?.data?.schedule?.attendances.some(
    (attendance) => attendance.userId === currentUserId
  );

  const isAttendanceStatus = data?.data?.schedule?.attendances.find(
    (attendance) => attendance.userId === currentUserId
  )?.attendanceStatus;

  const canEditNotice = currentUserId === data?.data?.schedule?.createdBy.id;
  const hasNoticeContent = Boolean(data?.data?.schedule?.description);

  const handleGoBack = () => {
    if (searchParams.get("tab") === "/my-schedules") {
      router.push("/my-schedules");
    } else {
      router.push("/");
    }
  };

  const handleStartEditNotice = () => {
    setNoticeContent(data?.data?.schedule?.description || "");
    setIsEditingNotice(true);
  };

  const handleCancelEditNotice = () => {
    setNoticeContent(data?.data?.schedule?.description || "");
    setIsEditingNotice(false);
  };

  const handleSaveNotice = async () => {
    setIsSavingNotice(true);
    try {
      const result = await updateScheduleNotice(scheduleId, noticeContent);
      if (result.success) {
        setIsEditingNotice(false);
        refetch(); // 데이터 새로고침
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("공지사항 저장 실패:", error);
      alert("공지사항 저장에 실패했습니다.");
    } finally {
      setIsSavingNotice(false);
    }
  };

  const handleDeleteSchedule = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSchedule(scheduleId);
      if (result.success) {
        await queryClient.invalidateQueries({
          queryKey: ["schedules"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["my-schedules"],
        });
        router.push("/"); // 메인 페이지로 이동
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("일정 삭제 실패:", error);
      alert("일정 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRespondInvitation = async (response: "ACCEPT" | "DECLINE") => {
    setIsRespondingInvitation(true);
    try {
      const result = await respondTeamInvitation(scheduleId, response);
      // const invitedTeamId = data?.data?.schedule?.invitedTeamId;
      // const result =
      //   response === "ACCEPT"
      //     ? await acceptTeamMatchInvitation({
      //         scheduleId,
      //         invitedTeamId: invitedTeamId!,
      //       })
      //     : await rejectTeamMatchInvitation({
      //         scheduleId,
      //         // reason: "거절 이유",
      //       });
      if (result.success) {
        refetch(); // 데이터 새로고침
        if (response === "ACCEPT") {
          alert("대전신청을 수락했습니다.");
        } else {
          alert("대전신청을 거절했습니다.");
        }
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("초청 응답 실패:", error);
      alert("초청 응답에 실패했습니다.");
    } finally {
      setIsRespondingInvitation(false);
    }
  };

  // 참석 상태 업데이트 핸들러
  const handleUpdateAttendanceStatus = async (
    status: "ATTENDING" | "NOT_ATTENDING"
  ) => {
    setIsUpdatingAttendance(true);
    try {
      const result = await updateAttendanceStatus(scheduleId, status);
      if (result.success) {
        refetch(); // 데이터 새로고침
        queryClient.invalidateQueries({ queryKey: ["scheduleAttendance"] });
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("참석 상태 업데이트 실패:", error);
      alert("참석 상태 업데이트에 실패했습니다.");
    } finally {
      setIsUpdatingAttendance(false);
    }
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      handleCancelEditNotice();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveNotice();
    }
  };

  if (!data) {
    return (
      <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin mx-auto mb-4" size={48} />
        <p className="text-gray-500">개요를 불러오는 중...</p>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="text-center text-gray-500 pt-10">
        존재하지 않는 일정입니다.
      </div>
    );
  }

  if (error) {
    console.warn(error, "error");
  }

  console.log(data, "data");

  const attendanceIds = data.data.schedule.attendances.map((attendance) => {
    return {
      userId: attendance.userId,
    };
  });
  console.log(attendanceIds, "attendances");

  console.log(
    data.data.schedule.attendanceDeadline,
    "data.data.schedule.attendanceDeadline"
  );

  console.log(data.data.schedule, "data.data.schedule.startTime");

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 뒤로 가기와 공유하기, 더보기 버튼 */}
      <div className="flex justify-between items-center shrink-0 px-4 h-16">
        <button
          className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
          onClick={handleGoBack}
        >
          <ArrowLeft style={{ width: "24px", height: "24px" }} />
        </button>
        <span className="font-semibold tracking-tight text-lg">
          {data.data.schedule?.matchType === "TEAM" ? "친선전" : "자체전"}
        </span>
        <div className="flex items-center justify-end gap-1.5">
          <button
            className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
            type="button"
            onClick={async () => {
              console.log(process.env.NODE_ENV, "env");
              try {
                if (process.env.NODE_ENV === "development") {
                  console.log("development");
                  await navigator.clipboard.writeText(
                    `localhost:3000/schedule/${scheduleId}`
                  );
                } else {
                  console.log("production");
                  await navigator.clipboard.writeText(
                    `www.futsalgo.com/schedule/${scheduleId}`
                  );
                }
              } catch (error) {
                console.error(error, "error");
              } finally {
                alert("URL이 복사되었습니다.");
              }
            }}
          >
            <Share className="size-5" />
          </button>
        </div>
      </div>

      {/* 공통 */}
      <div className="w-full flex flex-col items-center justify-center px-4 mb-6 gap-1">
        {/* <span className="flex items-center gap-1 justify-center text-lg font-medium tracking-tight">
          {data.data.schedule?.startTime?.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </span> */}
        <span className="flex items-center gap-1 justify-center font-semibold text-2xl">
          {data.data.schedule?.place}
        </span>
        <div className="w-full flex justify-center items-center gap-2 text-base tracking-tight">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-4 text-gray-500" strokeWidth={2} />
            {new Date(data.data.schedule?.date).toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
          <Separator
            orientation="vertical"
            className="!h-3 !w-0.25 bg-gray-300"
          />
          <div className="flex items-center gap-1.5">
            <ClockIcon className="size-4 text-gray-500" strokeWidth={2} />
            {formatTimeRange(
              data.data.schedule?.date,
              data.data.schedule?.startTime,
              data.data.schedule?.endTime
            )}
          </div>
        </div>
      </div>

      {/* 친선전 요청 대기 상태 (PENDING) */}
      {data.data.schedule.status === "PENDING" &&
        (isAttendance || data.data.isManager) && (
          <div className="mx-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 rounded-2xl p-4 select-none mb-4 bg-amber-600/5 border border-amber-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-white">
                <HourglassHighIcon
                  className="size-6 text-amber-600"
                  weight="fill"
                />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full flex justify-center items-center gap-1 tracking-tight font-medium">
                  {data.data.isManager === "GUEST"
                    ? "친선전을 제안 받았습니다. 응답해주세요"
                    : "초청팀 응답을 기다리는 중입니다."}
                </div>
              </div>
            </div>
            {data.data.isManager === "GUEST" && (
              <div className="w-full sm:w-48 shrink-0 grid grid-cols-2 items-center gap-1.5">
                <button
                  className="sm:text-sm grow h-11 sm:h-10 font-semibold rounded-sm active:scale-95 transition-all duration-200 flex items-center gap-3 justify-center text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={() => handleRespondInvitation("ACCEPT")}
                  disabled={isRespondingInvitation}
                >
                  {isRespondingInvitation ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  수락
                </button>
                <button
                  className="sm:text-sm grow h-11 sm:h-10 font-semibold rounded-sm active:scale-95 transition-all duration-200 flex items-center gap-3 justify-center text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={() => handleRespondInvitation("DECLINE")}
                  disabled={isRespondingInvitation}
                >
                  {isRespondingInvitation ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  거절
                </button>
              </div>
            )}
          </div>
        )}

      {/* 친선전 요청 거절 상태 (REJECTED) */}
      {data.data.schedule.status === "REJECTED" &&
        (isAttendance || data.data.isManager) && (
          <div className="mx-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 rounded-2xl p-4 select-none mb-4 bg-slate-600/5 border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-white">
                <CalendarXIcon
                  className="size-6 text-slate-600"
                  weight="fill"
                />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full flex justify-center items-center gap-1 tracking-tight font-medium">
                  초청팀이 친선전을 거절했습니다.
                  {/* {data.data.isManager === "GUEST"
                    ? "친선전을 거절했습니다."
                    : "초청팀이 친선전을 거절했습니다."} */}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* 경기일정 참석여부 투표 */}
      {isAttendance &&
        data.data.schedule.status === "READY" &&
        data.data.schedule.enableAttendanceVote &&
        data.data.schedule.attendanceDeadline &&
        data.data.schedule.attendanceDeadline > new Date() && (
          <div className="mx-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-50 rounded-2xl p-4 select-none mb-4 border border-slate-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-white">
                <CalendarCheckIcon
                  className="size-6 text-indigo-600"
                  weight="fill"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">경기일정 참석여부</span>
                <div className="w-full flex items-center gap-1 tracking-tight text-sm">
                  <span className="font-medium text-indigo-700">
                    {new Date(
                      data.data.schedule.attendanceDeadline
                    ).toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                    까지
                  </span>
                  선택해주세요.
                </div>
              </div>
            </div>
            <div className="w-full sm:w-48 shrink-0 grid grid-cols-2 items-center gap-1.5">
              <button
                className={`sm:text-sm grow h-11 sm:h-10 font-semibold rounded-sm active:scale-95 transition-all duration-200 flex items-center gap-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  isAttendanceStatus === "ATTENDING"
                    ? "text-white bg-indigo-600 hover:bg-indigo-700"
                    : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                }`}
                onClick={() => handleUpdateAttendanceStatus("ATTENDING")}
                disabled={isUpdatingAttendance}
              >
                {isUpdatingAttendance ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isAttendanceStatus !== "ATTENDING" ? (
                  <Square className={`size-5 text-indigo-600`} />
                ) : (
                  <SquareCheckBigIcon
                    className={`size-5 ${
                      isAttendanceStatus === "ATTENDING"
                        ? "text-white"
                        : "text-indigo-600"
                    }`}
                  />
                )}
                참석
              </button>
              <button
                className={`sm:text-sm grow h-11 sm:h-10 font-semibold rounded-sm active:scale-95 transition-all duration-200 flex items-center gap-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  isAttendanceStatus === "NOT_ATTENDING"
                    ? "text-white bg-red-600 hover:bg-red-700"
                    : "text-red-600 bg-red-50 hover:bg-red-100"
                }`}
                onClick={() => handleUpdateAttendanceStatus("NOT_ATTENDING")}
                disabled={isUpdatingAttendance}
              >
                {isUpdatingAttendance ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isAttendanceStatus !== "NOT_ATTENDING" ? (
                  <Square className={`size-5 text-red-600`} />
                ) : (
                  <SquareCheckBigIcon
                    className={`size-5 ${
                      isAttendanceStatus === "NOT_ATTENDING"
                        ? "text-white"
                        : "text-red-600"
                    }`}
                  />
                )}
                불참
              </button>
            </div>
          </div>
        )}

      <div className="space-y-6">
        {isLoading && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 items-center justify-center h-40 w-60 bg-gradient-to-br from-slate-100 to-zinc-100 rounded-lg">
            <Loader2
              className="w-4 h-4 animate-spin"
              style={{ width: "40px", height: "40px", color: "gray" }}
            />
            <div className="text-base text-muted-foreground">
              로딩 중입니다.
            </div>
          </div>
        )}

        {/* 경기 정보 */}
        {(() => {
          // date 필드 사용 (날짜만 포함)
          const scheduleDate = new Date(data.data.schedule.date);
          const today = new Date();

          // 날짜만 비교하기 위해 시간 제거
          scheduleDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          // READY 상태: 오늘이거나 지난 날짜
          // PLAY 상태: 항상 표시
          return (
            (data.data.schedule.status === "READY" && scheduleDate <= today) ||
            data.data.schedule.status === "PLAY"
          );
        })() && (
          <div className="px-4">
            {data.data.schedule.matches.length > 0 ? (
              <div className="rounded-md border border-gray-300 hover:border-gray-400 transition-colors overflow-hidden shadow-xs group">
                {data.data.schedule.matches.map((match, index) => (
                  <div
                    className="overflow-hidden border-b border-gray-300 last:border-b-0 group-hover:border-gray-400 transition-colors"
                    key={match.id}
                  >
                    <div
                      className="w-full flex items-center justify-between px-4 h-12 sm:h-11 gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        router.push(
                          `/schedule/${scheduleId}/match/${
                            match.id
                          }?tab=${searchParams.get("tab")}`
                        );
                      }}
                    >
                      <div className="flex items-center space-x-2 shrink-0">
                        <SoccerBallIcon
                          weight="fill"
                          className="size-5 text-gray-800"
                        />
                        <span className="font-medium min-w-10">
                          {index + 1}경기
                        </span>
                        <Separator
                          orientation="vertical"
                          className="!h-4 !w-px bg-gray-300"
                        />
                        <span className="tracking-tight text-slate-500 min-w-11 text-center">
                          {getMatchLineupCount(match)}
                        </span>
                      </div>
                      {match.isLinedUp ? (
                        <div className="flex items-center gap-1 font-medium">
                          <span className="hidden sm:inline px-2 text-sm tracking-tight text-gray-400">
                            스코어
                          </span>
                          <span className="bg-gray-100 rounded-sm text-base text-gray-800 min-w-14 px-2 text-center flex items-center justify-center h-7">
                            {match.homeScore} - {match.awayScore}
                          </span>
                          <ChevronRight className="size-5 text-gray-400 shrink-0" />
                        </div>
                      ) : (
                        <ChevronRight className="size-5 text-gray-400 shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-gray-50 flex flex-col sm:items-center justify-center gap-0.5 rounded-2xl min-h-16 text-gray-500">
                <p className="font-medium text-gray-700">경기가 없습니다.</p>
                <p className="whitespace-pre-line break-keep text-sm mb-2">
                  경기를 추가하고 득점 기록을 남겨주세요.
                </p>
              </div>
            )}

            {/* 경기 추가 버튼 */}
            {canEditNotice && (
              <div className="pt-3">
                <Button
                  type="button"
                  className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 sm:!h-11 !text-lg"
                  size="lg"
                  onClick={async () => {
                    try {
                      const result = await addMatch(scheduleId);
                      if (result.success) {
                        refetch();
                      } else {
                        console.log(result.error, "result.error");
                        alert(result.error);
                      }
                    } catch (error) {
                      console.error(error, "error");
                      alert("경기 추가에 실패했습니다.");
                    }
                  }}
                >
                  <div className="size-6 rounded-full bg-white flex items-center justify-center">
                    <PlusIcon
                      className="size-5 text-indigo-700"
                      strokeWidth={2.75}
                    />
                  </div>
                  경기 추가
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 경기 통계 */}
        {data.data.schedule.matches.length > 0 && (
          <MatchStatsLeaderboard
            schedule={data.data.schedule}
            isMember={data.data.isMember}
          />
        )}

        {/* MVP */}
        {new Date(
          `${data.data.schedule.date} ${data.data.schedule.startTime}`
        ) <= new Date() &&
          data.data.schedule.matches.length > 0 &&
          data.data.schedule.matches.filter((match) => match.isLinedUp).length >
            0 && <ScheduleMvp scheduleId={scheduleId} />}

        {/* 사진 */}
        {(data.data.schedule.status === "READY" ||
          data.data.schedule.status === "PLAY") &&
          new Date(
            `${data.data.schedule.date} ${data.data.schedule.startTime}`
          ) <= new Date() &&
          data.data.schedule.matches.filter((match) => match.isLinedUp).length >
            0 && <SchedulePhotosGallery scheduleId={scheduleId} />}

        {/* 공지사항 */}
        {(data.data.schedule.status === "READY" ||
          data.data.schedule.status === "PLAY") &&
          data?.data?.isMember && (
            <div className="px-4">
              <div className="flex justify-between items-center py-2 min-h-13">
                <div className="flex items-center gap-2">
                  <MegaphoneSimpleIcon
                    weight="fill"
                    className="size-7 text-zinc-500"
                  />
                  <h2 className="text-lg font-semibold">공지사항</h2>
                  {/* <Separator
                    orientation="vertical"
                    className="!h-4 !bg-gray-300"
                  />
                  <span className="text-base font-medium text-gray-500">
                    비공개
                  </span> */}
                </div>
                <div className="flex items-center gap-2">
                  {!isEditingNotice && (
                    <Button
                      size="sm"
                      className="text-base sm:text-sm !font-semibold rounded-full bg-neutral-100 text-gray-700 hover:bg-neutral-200 gap-1.5"
                      onClick={() => setIsNoticeOpen(!isNoticeOpen)}
                    >
                      {isNoticeOpen ? "접기" : "펼치기"}
                      {isNoticeOpen ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* 비공개 안내 */}
              <div className="h-9 mb-2 flex items-center gap-2 px-4 bg-amber-400/10 rounded-sm text-amber-700">
                <Info className="size-5" />
                <span className="text-sm">
                  공지사항은{" "}
                  <span className="font-medium text-amber-800">주최팀</span>{" "}
                  또는{" "}
                  <span className="font-medium text-amber-800">초청팀</span>만
                  볼 수 있습니다.
                </span>
              </div>

              {isNoticeOpen && (
                <div className="space-y-3">
                  {!isEditingNotice ? (
                    // 읽기 모드
                    <div>
                      {hasNoticeContent ? (
                        <div className="border p-4 bg-white rounded-2xl min-h-40 whitespace-pre-line break-words">
                          {data?.data?.schedule?.description}
                        </div>
                      ) : (
                        <div className="p-8 bg-gray-50 flex flex-col sm:items-center justify-center gap-0.5 rounded-2xl min-h-16 text-gray-500">
                          <p className="font-medium text-gray-700">
                            공지사항이 없습니다.
                          </p>
                          <p className="whitespace-pre-line break-keep text-sm mb-2">
                            예약자, 풋살장 출입 방법, 주차장 이용 방법, 주의
                            사항 등을 알려주세요.
                          </p>
                        </div>
                      )}

                      {/* 편집 버튼 (글쓴이만) */}
                      {canEditNotice && (
                        <div className="pt-3">
                          <Button
                            // size="sm"
                            variant="outline"
                            className="text-base sm:text-sm font-semibold gap-2 border-gray-300 hover:border-gray-400"
                            onClick={handleStartEditNotice}
                          >
                            <Edit3 className="size-4" />
                            {hasNoticeContent ? "수정하기" : "공지사항 작성"}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // 편집 모드
                    <div className="space-y-3">
                      <textarea
                        ref={textareaRef}
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="공지사항을 입력해주세요..."
                        className="w-full min-h-40 p-4 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveNotice}
                          disabled={isSavingNotice}
                          className="font-semibold gap-2"
                        >
                          {isSavingNotice ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Save className="size-4" />
                          )}
                          저장
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEditNotice}
                          disabled={isSavingNotice}
                          className="font-semibold gap-2"
                        >
                          <X className="size-4" />
                          취소
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        ESC로 취소, Ctrl+Enter로 저장
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* 참석 인원 탭 내용 */}
        {(data.data.schedule.status === "READY" ||
          data.data.schedule.status === "PLAY") && (
          <ScheduleAttendance scheduleId={scheduleId} />
        )}

        {(data.data.schedule.status === "PENDING" ||
          data.data.schedule.status === "REJECTED") && (
          <div className="relative grid grid-cols-2 px-4 pt-6 pb-3 sm:pb-6 gap-8 bg-gradient-to-b from-slate-100 to-white sm:to-slate-50 sm:mx-4 sm:rounded-md">
            <TeamSide
              logoUrl={data.data.schedule.hostTeam?.logoUrl}
              name={data.data.schedule.hostTeam?.name ?? ""}
              teamId={data.data.schedule.hostTeam?.id}
              label="주최팀"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 shrink-0 w-20 pt-4 pb-3 sm:pb-6">
              <div className="flex items-center gap-2 text-4xl text-gray-500 font-light tracking-tighter my-auto">
                vs
              </div>
            </div>
            <TeamSide
              logoUrl={data.data.schedule.invitedTeam?.logoUrl}
              name={data.data.schedule.invitedTeam?.name ?? ""}
              teamId={data.data.schedule.invitedTeam?.id}
              label="초청팀"
            />
          </div>
        )}

        {/* 댓글 */}
        <ScheduleComments scheduleId={scheduleId} />
      </div>

      {/* 만든 날짜와 만든이 */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <span className="text-center text-sm text-gray-500">
          만든 날:{" "}
          {data?.data?.schedule?.startTime
            ? new Date(data?.data?.schedule?.createdAt).toLocaleDateString(
                "ko-KR",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )
            : ""}
        </span>
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => {
            router.push(`/players/${data.data.schedule?.createdBy.id}`);
          }}
        >
          <Image
            src={data.data.schedule?.createdBy.image ?? ""}
            alt="avatar"
            width={24}
            height={24}
            className="rounded-lg"
          />
          <span className="text-sm font-medium text-gray-500 group-hover:underline group-hover:text-gray-700 underline-offset-2">
            {data.data.schedule?.createdBy.nickname}
          </span>
        </div>
      </div>

      {/* 수정 및 삭제 */}
      {canEditNotice && (
        <div className="px-4 flex flex-col gap-2 mt-6">
          {/* <Button variant="destructive" type="button">
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                삭제 중...
              </>
            ) : (
              "삭제"
            )}
          </Button> */}
          <button
            type="button"
            className="my-4 rounded-md px-3 w-full flex items-center justify-center h-12 sm:h-11 gap-3 cursor-pointer bg-destructive/5 hover:bg-destructive/10 transition-colors text-destructive font-medium disabled:opacity-30 disabled:cursor-default"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                삭제 중...
              </>
            ) : (
              "삭제"
            )}
          </button>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">일정 삭제</h3>
            <p className="text-gray-600 mb-6">
              정말로 이 일정을 삭제하시겠습니까?
              <br />
              삭제된 일정은 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                아니요
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteSchedule}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    삭제 중...
                  </>
                ) : (
                  "예"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleContent;
