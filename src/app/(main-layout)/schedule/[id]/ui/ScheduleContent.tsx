"use client";

import {
  ArrowLeft,
  Share,
  ChevronRight,
  // Flag,
  Loader2,
  // MailOpen,
  // Megaphone,
  // UserRound,
  PlusIcon,
  ChevronUp,
  ChevronDown,
  // Timer,
  // Calendar,
  // Timer,
  // Vote,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ScheduleAttendance from "./ScheduleAttendance";
// import ScheduleDetails from "./ScheduleDetails";
import {
  CalendarCheckIcon,
  // CourtBasketballIcon,
  // MegaphoneSimpleIcon,
  SoccerBallIcon,
} from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import SchedulePhotosGallery from "./SchedulePhotosGallery";
import { MatchType } from "@prisma/client";
import ScheduleComments from "./ScheduleComments";
import ScheduleMvp from "./ScheduleMvp";
import { useSession } from "next-auth/react";
import { getSchedule } from "../actions/get-schedule";
import { Button } from "@/shared/components/ui/button";
import { addMatch } from "../actions/add-match";
import Image from "next/image";
// import { Separator } from "@/shared/components/ui/separator";

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

export const tabs = [
  {
    label: "개요",
    value: "overview",
    isDisabled: false,
  },
  {
    label: "참석자",
    value: "attendance",
    isDisabled: false,
  },
  {
    label: "MVP",
    value: "mvp",
    isDisabled: false,
  },
  {
    label: "사진",
    value: "photos",
    isDisabled: false,
  },
  {
    label: "댓글",
    value: "comments",
    isDisabled: false,
  },
  // {
  //   label: "후기",
  //   value: "reviews",
  //   isDisabled: true,
  // },
];

const ScheduleContent = ({
  scheduleId,
  isLikedSchedule,
  startTime,
  matchType,
}: {
  scheduleId: string;
  isLikedSchedule?: boolean;
  startTime?: Date;
  matchType?: MatchType;
}) => {
  console.log(isLikedSchedule, "isLikedSchedule");
  console.log(startTime, "startTime");
  console.log(matchType, "matchType");
  const router = useRouter();
  // const queryClient = useQueryClient();

  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  console.log(tab, "tab");
  // const validTab = tabs.find((t) => t.value === tab);
  // const [selectedTab, setSelectedTab] = useState<string>(
  //   validTab ? validTab.value : tabs[0].value
  // );
  // const [isLiked, setIsLiked] = useState(isLikedSchedule);
  const [isNoticeOpen, setIsNoticeOpen] = useState(true);

  const session = useSession();
  const currentUserId = session.data?.user?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => getSchedule(scheduleId),
    placeholderData: keepPreviousData,
  });

  const isAttendance = data?.data?.schedule?.attendances.some(
    (attendance) => attendance.userId === currentUserId
  );

  const handleGoBack = () => {
    router.push("/");
  };

  // const handleLikeClick = async (scheduleId: string) => {
  //   const result = await likeSchedule({ scheduleId });
  //   console.log(result);
  //   if (result.success) {
  //     queryClient.invalidateQueries({ queryKey: ["schedules"] });
  //     setIsLiked(result.liked);
  //     alert(result.message);
  //   } else {
  //     console.warn(result.error);
  //     // toast.error(result.error);
  //   }
  // };

  // const timeRange = formatTimeRange({
  //   time: {
  //     start: data.data.schedule?.startTime as Date,
  //     end: data.data.schedule?.endTime as Date,
  //   },
  // });

  // const opposingTeam =
  //   data.data.schedule?.matchType === "SQUAD"
  //     ? data.data.schedule.hostTeam
  //     : data.data.schedule?.guestTeam;

  // const timeString = data.data.schedule?.startTime?.toLocaleTimeString(
  //   "ko-KR",
  //   {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   }
  // );

  // const [period, time] = timeString?.split(" ") || [];

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

  // const dDay = calculateDday(data.data.schedule?.date as Date);
  const attendanceIds = data.data.schedule.attendances.map((attendance) => {
    return {
      userId: attendance.userId,
    };
  });
  console.log(attendanceIds, "attendances");

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
        <span
          // className="font-semibold tracking-tight"
          className={`flex items-center justify-center font-semibold ${
            data.data.schedule?.matchType === "TEAM"
              ? "text-indigo-600"
              : "text-emerald-600"
          }`}
        >
          {/* {data.data.schedule?.startTime?.toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
            weekday: "narrow",
            hour: "numeric",
            minute: "numeric",
          })} */}
          {data.data.schedule?.matchType === "TEAM" ? "친선전" : "자체전"}
        </span>
        <div className="flex items-center justify-end gap-1.5">
          {/* 좋아요 */}
          {/* <button
            className={`shrink-0 size-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
              isLiked ? "hover:bg-indigo-600/10" : "hover:bg-gray-100 group"
            }`}
            onClick={() => handleLikeClick(scheduleId)}
          >
            <HeartIcon
              className={`size-6 transition-colors ${
                isLiked
                  ? "text-indigo-600"
                  : "text-zinc-300 group-hover:text-zinc-400"
              }`}
              weight="fill"
            />
          </button> */}
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
            <Share className="size-5" />
          </button>
        </div>
      </div>

      {/* 공통 */}
      <div className="w-full flex flex-col items-center justify-center px-4 my-4">
        <span className="flex items-center gap-1 justify-center font-semibold text-2xl tracking-tight">
          {data.data.schedule?.startTime?.toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
            weekday: "long",
            hour: "numeric",
            minute: "numeric",
          })}
        </span>
        <div className="w-full flex justify-center items-center gap-1 text-lg  tracking-tight">
          {data.data.schedule?.place}
        </div>
      </div>

      {isAttendance && (
        <div className="mx-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-100 rounded-2xl p-3 sm:px-4 select-none my-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-white/80">
              <CalendarCheckIcon
                className="size-6 text-indigo-700"
                weight="fill"
              />
              {/* <Calendar className="size-5 text-gray-600" /> */}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">경기일정 참석여부</span>
              <div className="w-full flex items-center gap-1 tracking-tight text-sm ">
                {/* <Timer className="size-5 text-amber-600" /> */}
                <span className="font-semibold text-indigo-700">
                  7월 11일 오전 10:00까지
                </span>
                선택해주세요.
              </div>
            </div>
          </div>
          <div className="w-full sm:w-48 shrink-0 flex items-center *:cursor-pointer gap-1.5 ">
            <button className="grow h-11 sm:h-9 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-800 rounded-sm active:scale-95 transition-all duration-200">
              참석
            </button>
            <button className="grow h-11 sm:h-9 font-medium text-gray-700 bg-blue-900/10 hover:bg-red-600/10 hover:text-destructive rounded-sm active:scale-95 transition-all duration-200">
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

        <div className="px-4">
          <div className="flex justify-between items-center py-2 min-h-12">
            <div className="flex items-center gap-2">
              {/* <CourtBasketballIcon
                weight="fill"
                className="size-6 text-gray-800"
              /> */}
              <h2 className="text-lg font-bold ">경기</h2>
            </div>
            {/* 경기 추가 버튼 */}
            {currentUserId &&
              data.data.schedule.createdBy.id === currentUserId && (
                <Button
                  size="sm"
                  className="text-sm font-bold rounded-full !px-3 gap-1"
                  onClick={async () => {
                    const result = await addMatch(scheduleId);
                    if (result.success) {
                      refetch();
                    } else {
                      console.log(result.error, "result.error");
                      // toast.error(result.error);
                    }
                  }}
                >
                  <PlusIcon className="size-4" strokeWidth={2.5} />
                  추가
                </Button>
              )}
          </div>

          {/* 경기 정보 */}
          {data.data.schedule.matches.length > 0 ? (
            <div className="rounded-md border overflow-hidden shadow-xs">
              {data.data.schedule.matches.map((match, index) => (
                <div
                  className="overflow-hidden border-b last:border-b-0"
                  key={match.id}
                >
                  <div
                    className="w-full flex items-center justify-between px-4 h-12 sm:h-11 gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      router.push(`/schedule/${scheduleId}/match/${match.id}`);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <SoccerBallIcon
                        weight="fill"
                        className="size-5 text-gray-800"
                      />
                      <span className="font-medium">{index + 1}경기</span>
                      {match.durationMinutes && (
                        <span className="text-sm text-gray-500">
                          {match.durationMinutes}분
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500 px-1">스코어</span>
                      <span className="text-base font-medium text-gray-500 min-w-12 px-1 text-center">
                        {match.homeScore} - {match.awayScore}
                      </span>
                      <ChevronRight className="size-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center bg-gray-50 rounded-2xl min-h-16 flex items-center justify-center">
              경기가 존재하지 않습니다.
            </div>
          )}
        </div>

        {/* 공지사항 */}
        {data.data.schedule.attendances.some(
          (attendance) => attendance.userId === currentUserId
        ) && (
          <div className="px-4">
            <div className="flex justify-between items-center py-2 min-h-12">
              <div className="flex items-center gap-2">
                {/* <MegaphoneSimpleIcon
                  weight="fill"
                  className="size-6 text-gray-800"
                /> */}
                <h2 className="text-lg font-bold ">공지사항</h2>
              </div>
              <Button
                size="sm"
                className="text-sm font-semibold rounded-full bg-neutral-100 text-gray-700 hover:bg-neutral-200 !px-3 gap-1"
                onClick={() => setIsNoticeOpen(!isNoticeOpen)}
              >
                {isNoticeOpen ? "접기" : "펼치기"}
                {isNoticeOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
            </div>
            {isNoticeOpen ? (
              Boolean(data?.data.schedule?.description) ? (
                <p className="border p-4 bg-white rounded-2xl min-h-40 whitespace-pre-line mb-3 break-words">
                  {data?.data.schedule?.description ?? "공지사항 없음"}
                </p>
              ) : (
                <p className="p-4 bg-gray-50 text-gray-500 rounded-2xl whitespace-pre-line mb-3 break-words min-h-16 flex items-center justify-center text-sm">
                  공지사항이 존재하지 않습니다.
                </p>
              )
            ) : null}
          </div>
        )}

        {/* 참석 인원 탭 내용 */}
        <ScheduleAttendance scheduleId={scheduleId} />

        {/* MVP */}
        <ScheduleMvp scheduleId={scheduleId} />

        {/* 사진 */}
        <SchedulePhotosGallery scheduleId={scheduleId} />

        {/* 댓글 */}
        <ScheduleComments scheduleId={scheduleId} />
      </div>

      {/* 만든 날짜와 만든이 */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <span className="text-center text-sm text-gray-500">
          만든 날:{" "}
          {data?.data?.schedule?.startTime
            ? new Date(data?.data?.schedule?.startTime).toLocaleDateString(
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
          className="flex items-center gap-1 group cursor-pointer"
          onClick={() => {
            router.push(`/players/${data.data.schedule?.createdBy.id}`);
          }}
        >
          <Image
            src={data.data.schedule?.createdBy.image ?? ""}
            alt="avatar"
            width={20}
            height={20}
            className="rounded-lg"
          />
          <span className="text-sm font-medium text-gray-500 group-hover:underline group-hover:text-gray-700 underline-offset-2">
            {data.data.schedule?.createdBy.nickname}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleContent;
