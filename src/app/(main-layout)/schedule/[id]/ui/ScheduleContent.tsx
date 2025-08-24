"use client";

import {
  ArrowLeft,
  Share,
  Calendar,
  ChevronRight,
  Clock,
  Flag,
  Loader2,
  MailOpen,
  MapPin,
  Megaphone,
  UserRound,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ScheduleAttendance from "./ScheduleAttendance";
// import ScheduleDetails from "./ScheduleDetails";
import { HeartIcon, SoccerBallIcon } from "@phosphor-icons/react";
import { likeSchedule } from "@/app/(main-layout)/actions/like-schedule";
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
import Image from "next/image";

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

const tabs = [
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
  console.log(startTime, "startTime");
  console.log(matchType, "matchType");
  const router = useRouter();
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const validTab = tabs.find((t) => t.value === tab);
  const [selectedTab, setSelectedTab] = useState<string>(
    validTab ? validTab.value : tabs[0].value
  );
  const [isLiked, setIsLiked] = useState(isLikedSchedule);

  const session = useSession();
  const currentUserId = session.data?.user?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => getSchedule(scheduleId),
    placeholderData: keepPreviousData,
  });

  const handleGoBack = () => {
    router.push("/");
  };

  const handleLikeClick = async (scheduleId: string) => {
    const result = await likeSchedule({ scheduleId });
    console.log(result);
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setIsLiked(result.liked);
      alert(result.message);
    } else {
      console.warn(result.error);
      // toast.error(result.error);
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
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          onClick={handleGoBack}
        >
          <ArrowLeft style={{ width: "24px", height: "24px" }} />
        </button>
        {/* <button
          className="flex items-center cursor-pointer select-none hover:bg-gray-100 rounded-full group pr-4"
          onClick={handleGoBack}
        >
          <div className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 rounded-full transition-colors">
            <ArrowLeft style={{ width: "24px", height: "24px" }} />
          </div>
          <h1 className="text-xl font-semibold">
            일정 상세
            {matchType === MatchType.SQUAD ? "자체전" : "친선전"}
            {startTime?.toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
            })}
            {startTime && `${startTime.getMonth() + 1}.${startTime.getDate()}`}
          </h1>
        </button> */}
        <div className="flex items-center justify-end gap-1.5">
          <button
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
            {/* 좋아요 */}
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Share className="size-5" />
          </button>
          {/* <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <EllipsisVertical className="size-5" />
          </button> */}
        </div>
      </div>

      {/* 공통 */}
      <div className="w-full flex flex-col items-center justify-center px-4 mb-8">
        <span className="flex items-center justify-center font-semibold text-2xl sm:text-xl tracking-tight">
          {data.data.schedule?.startTime?.toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
            weekday: "long",
            hour: "numeric",
            minute: "numeric",
          })}
        </span>
        <div className="w-full flex justify-center items-center gap-1 text-lg sm:text-base tracking-tight">
          {data.data.schedule?.place}
          <span
            className={`flex items-center justify-center ${
              data.data.schedule?.matchType === "TEAM"
                ? "text-indigo-700"
                : "text-emerald-700"
            }`}
          >
            {data.data.schedule?.matchType === "TEAM" ? "친선전" : "자체전"}
          </span>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex items-center justify-between gap-2 px-4 border-b">
        <div className="flex h-12 space-x-2">
          {tabs.map((tab) => (
            <div
              key={tab.value}
              className={`flex justify-center items-center min-w-14 font-semibold text-base px-2 cursor-pointer border-b-4 ${
                selectedTab === tab.value
                  ? "border-gray-700"
                  : "border-transparent"
              } ${tab.isDisabled ? "pointer-events-none opacity-50" : ""}`}
              onClick={() => setSelectedTab(tab.value)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* 탭 */}
      {/* <div className="bg-slate-100 flex items-center px-4 sm:px-2 sm:mx-4 h-12  sm:rounded-full">
        {tabs.map((tab) => (
          <div
            key={tab.value}
            className={`flex justify-center items-center font-semibold text-base px-4 cursor-pointer h-9 rounded-full ${
              selectedTab === tab.value ? "bg-black text-white" : ""
            } ${tab.isDisabled ? "pointer-events-none opacity-50" : ""}`}
            onClick={() => setSelectedTab(tab.value)}
          >
            {tab.label}
          </div>
        ))}
      </div> */}

      {/* 참석 인원 탭 내용 */}
      {selectedTab === "attendance" && (
        <ScheduleAttendance scheduleId={scheduleId} />
      )}

      {selectedTab === "overview" && (
        <div className="space-y-3 mt-3">
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

          <div className="relative">
            <div className="">
              {/* 경기 정보 */}
              {data.data.schedule.matches.length > 0 && (
                <div className="px-4">
                  <div className="rounded-md border overflow-hidden shadow-xs">
                    {data.data.schedule.matches.map((match, index) => (
                      <div
                        className="overflow-hidden border-b last:border-b-0"
                        key={match.id}
                      >
                        <div
                          className="w-full flex items-center justify-between px-4 h-12 sm:h-11 gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            router.push(
                              `/schedule/${scheduleId}/match/${match.id}`
                            );
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <SoccerBallIcon
                              className="size-5 text-gray-600"
                              weight="fill"
                            />
                            <span className="font-medium">{index + 1}경기</span>
                            {match.durationMinutes && (
                              <span className="text-sm text-gray-500">
                                {match.durationMinutes}분
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-base font-medium text-gray-500">
                              {match.homeScore} - {match.awayScore}
                            </span>
                            <ChevronRight className="size-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 경기 추가 버튼 */}
              {currentUserId &&
                data.data.schedule.createdBy.id === currentUserId && (
                  <div className="px-4 py-2">
                    <Button
                      type="button"
                      className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
                      size="lg"
                      onClick={async () => {
                        const result = await addMatch(scheduleId);
                        if (result.success) {
                          refetch();
                        } else {
                          console.log(result.error, "result.error");
                          // toast.error(result.error);
                        }
                      }}
                      // onClick={() => {
                      //   router.push(`/schedule/${scheduleId}/match/add`);
                      // }}
                    >
                      경기 추가
                    </Button>
                  </div>
                )}

              {/* 공지사항 */}
              <div>
                <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 gap-3">
                  <div className="flex items-center space-x-2">
                    <Megaphone className={`size-5 text-gray-600`} />
                    <span className="font-medium">공지사항</span>
                  </div>
                  {!Boolean(data?.data.schedule?.description) && (
                    <span className="text-base font-medium text-gray-500">
                      없음
                    </span>
                  )}
                </div>
                {Boolean(data?.data.schedule?.description) && (
                  <p className="mx-4 border p-4 bg-white rounded-2xl min-h-40 whitespace-pre-line mb-3 break-words">
                    {data?.data.schedule?.description ?? "공지사항 없음"}
                  </p>
                )}
              </div>

              {/* 주최팀 */}
              <div
                className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  router.push(`/teams/${data.data.schedule?.hostTeam.id}`);
                }}
              >
                <div className="flex items-center space-x-2">
                  <Flag className="size-5 text-gray-600" />
                  <span className="font-medium">주최팀</span>
                </div>
                <div className="flex items-center gap-1">
                  <Image
                    src={data.data.schedule?.hostTeam.logoUrl ?? ""}
                    alt="avatar"
                    width={24}
                    height={24}
                    className="rounded-lg"
                  />
                  <span className="text-base font-medium text-gray-500">
                    {data.data.schedule?.hostTeam?.name}
                  </span>
                  <ChevronRight className="size-5 text-gray-400" />
                </div>
              </div>

              {/* 초청팀 */}
              {data.data.schedule.invitedTeam && (
                <div
                  className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3 cursor-pointer  hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    router.push(`/teams/${data.data.schedule?.invitedTeamId}`);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <MailOpen className="size-5 text-gray-600" />
                    <span className="font-medium">초청팀</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Image
                      src={data.data.schedule?.invitedTeam.logoUrl ?? ""}
                      alt="avatar"
                      width={24}
                      height={24}
                      className="rounded-lg"
                    />
                    <span className="text-base font-medium text-gray-500">
                      {data.data.schedule?.invitedTeam?.name}
                    </span>
                    <ChevronRight className="size-5 text-gray-400" />
                  </div>
                </div>
              )}

              {/* 장소 이름 */}
              <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="size-5 text-gray-600" />
                  <span className="font-medium">장소</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-base font-medium text-gray-500">
                    {data.data.schedule?.place}
                  </span>
                </div>
              </div>

              {/* 경기 일자 */}
              <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="size-5 text-gray-600" />
                  <span className="font-medium">일자</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-base font-medium text-gray-500">
                    {data.data.schedule?.startTime?.toLocaleDateString(
                      "ko-KR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      }
                    )}
                  </span>
                </div>
              </div>

              {/* 예약 시간 */}
              <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3">
                <div className="flex items-center space-x-2">
                  <Clock className="size-5 text-gray-600" />
                  <span className="font-medium">시간</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-base font-medium text-gray-500">
                    {data.data.schedule?.startTime?.toLocaleTimeString(
                      "ko-KR",
                      {
                        hour: "numeric",
                        minute: "numeric",
                      }
                    )}{" "}
                    -{" "}
                    {data.data.schedule?.endTime?.toLocaleTimeString("ko-KR", {
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* 만든이 */}
              <div
                className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3 cursor-pointer  hover:bg-gray-50 transition-colors"
                onClick={() => {
                  router.push(`/players/${data.data.schedule?.createdBy.id}`);
                }}
              >
                <div className="flex items-center space-x-2">
                  <UserRound className="size-5 text-gray-600" />
                  <span className="font-medium">만든이</span>
                </div>
                <div className="flex items-center gap-1">
                  <Image
                    src={data.data.schedule?.createdBy.image ?? ""}
                    alt="avatar"
                    width={24}
                    height={24}
                    className="rounded-lg mr-1"
                  />
                  <span className="text-base font-medium text-gray-500">
                    {data.data.schedule?.createdBy.nickname}
                  </span>
                  <ChevronRight className="size-5 text-gray-400" />
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
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
            </p>
          </div>
          {/* 팀원 */}
          {/* {selectedTab === "members" && (
          <TeamMemberList
            members={data.data.members}
            isMember={data.data.currentUserMembership.isMember}
            role={data.data.currentUserMembership.role}
            status={data.data.currentUserMembership.status}
            refetch={refetch}
            teamId={id}
          />
        )} */}
        </div>
      )}

      {selectedTab === "photos" && (
        <SchedulePhotosGallery scheduleId={scheduleId} />
      )}

      {selectedTab === "comments" && (
        <ScheduleComments scheduleId={scheduleId} />
      )}

      {selectedTab === "mvp" && <ScheduleMvp scheduleId={scheduleId} />}
    </div>
  );
};

export default ScheduleContent;
