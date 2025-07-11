"use client";

import { useQuery } from "@tanstack/react-query";
import { getSchedule } from "../actions/get-schedule";
import {
  ArrowLeft,
  Calendar,
  ChartPie,
  ChevronRight,
  Clock,
  EllipsisVertical,
  Loader2,
  Share,
  Text,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { MapPinSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Label } from "@/shared/components/ui/label";

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
    label: "정보",
    value: "overview",
    isDisabled: false,
  },
  {
    label: "후기",
    value: "reviews",
    isDisabled: true,
  },
  {
    label: "사진",
    value: "photos",
    isDisabled: true,
  },
];

const ScheduleContent = ({ scheduleId }: { scheduleId: string }) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].value);

  const { data, isLoading, error } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => getSchedule(scheduleId),
  });
  console.log(data, "data");
  console.log(scheduleId, "scheduleId");
  console.log(error, "error");

  const handleGoBack = () => {
    router.back();
  };

  if (!data) {
    return (
      <div className="text-center text-gray-500 pt-10">
        일정 정보를 불러오는 중입니다.
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

  // const timeRange = formatTimeRange({
  //   time: {
  //     start: data.data.schedule?.startTime as Date,
  //     end: data.data.schedule?.endTime as Date,
  //   },
  // });

  const opposingTeam =
    data.data.schedule?.matchType === "SQUAD"
      ? data.data.schedule.hostTeam
      : data.data.schedule?.guestTeam;

  const dDay = calculateDday(data.data.schedule?.date as Date);
  const timeString = data.data.schedule?.startTime?.toLocaleTimeString(
    "ko-KR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const [period, time] = timeString?.split(" ") || [];

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {isLoading && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 items-center justify-center h-40 w-60 bg-gradient-to-br from-slate-100 to-zinc-100 backdrop-blur-lg rounded-lg">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ width: "40px", height: "40px", color: "gray" }}
          />
          <div className="text-base text-muted-foreground">로딩 중입니다.</div>
        </div>
      )}
      {/* 상단: 뒤로 가기와 공유하기, 더보기 버튼 */}
      <div className="grid grid-cols-3 items-center shrink-0 px-3 h-16">
        <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <ArrowLeft
            style={{ width: "24px", height: "24px" }}
            onClick={handleGoBack}
          />
        </button>
        <span className="text-center font-bold">
          {data?.data?.schedule?.place}
          {/* {
            MATCH_TYPE[
              data?.data?.schedule?.matchType as keyof typeof MATCH_TYPE
            ]
          } */}
        </span>
        <div className="flex items-center justify-end gap-2">
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Share className="w-5 h-5" />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <EllipsisVertical className="size-5" />
          </button>
        </div>
      </div>
      {data ? (
        <div className="space-y-3">
          {/* 일정 정보 */}
          <div className="relative border-b border-gray-300">
            {/* 팀 정보 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 px-4 gap-24 sm:gap-3 relative">
              {/* 주최팀 */}
              <div className="flex flex-col items-center border border-gray-100 rounded-lg hover:border-gray-400 hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden pb-6 group">
                <div className="text-slate-600 sm:text-lg font-medium tracking-tight mb-4 w-full h-9 sm:h-11 bg-indigo-500/5 flex items-center justify-center transition-colors duration-300 gap-2">
                  <div className="size-3 bg-indigo-500 rounded-full" />
                  {/* 주최팀 */}
                  {data?.data?.schedule?.matchType === "SQUAD"
                    ? "홈"
                    : "주최팀"}
                </div>
                {data?.data?.schedule?.hostTeam?.logoUrl ? (
                  <div className="">
                    <Image
                      src={data?.data?.schedule?.hostTeam?.logoUrl}
                      alt="logo"
                      width={64}
                      height={64}
                    />
                  </div>
                ) : (
                  <div className="">
                    {data?.data?.schedule?.hostTeam?.name.charAt(0)}
                  </div>
                )}
                <span className="font-semibold">
                  {data?.data?.schedule?.hostTeam?.name}
                </span>
              </div>
              {/* 데스크탑 공통 */}
              <div className="hidden sm:flex flex-col items-center justify-center">
                <span className="hidden sm:h-10 sm:flex items-center justify-center font-semibold text-xl sm:text-3xl tracking-tight">
                  {data.data.schedule?.startTime?.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div className="w-full flex flex-col items-center">
                  {data.data.schedule?.startTime?.toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              {/* 모바일 공통 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:hidden flex flex-col items-center justify-center pb-3">
                <span className="h-5 flex items-center justify-center font-semibold text-lg tracking-tight">
                  {period}
                </span>
                <span className="h-8 flex items-center justify-center font-semibold text-xl tracking-tight">
                  {time}
                </span>
                <div className="text-sm w-full flex flex-col items-center">
                  {data.data.schedule?.startTime?.toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              {/* 초청팀 */}
              <div className="flex flex-col items-center border border-gray-100 rounded-lg hover:border-gray-400 hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden pb-6 group">
                <div className="text-slate-600 sm:text-lg font-medium tracking-tight mb-4 w-full h-9 sm:h-11 bg-emerald-500/5 flex items-center justify-center transition-colors duration-300 gap-2">
                  <div className="size-3 bg-emerald-500 rounded-full" />
                  {/* 초청팀 */}
                  {data?.data?.schedule?.matchType === "SQUAD"
                    ? "어웨이"
                    : "초청팀"}
                </div>
                {opposingTeam?.logoUrl ? (
                  <div className="">
                    <Image
                      src={opposingTeam?.logoUrl}
                      alt="logo"
                      width={64}
                      height={64}
                    />
                  </div>
                ) : (
                  <div className="">{opposingTeam?.name.charAt(0)}</div>
                )}
                <span className="font-semibold">{opposingTeam?.name}</span>
              </div>
            </div>

            {/* 경기 시작 버튼 */}
            <div className="p-4">
              <div className="w-full flex flex-col items-center">
                {data.data.schedule?.status === "PENDING" ? (
                  <div className="h-12 w-full flex justify-center items-center text-lg font-semibold bg-muted text-muted-foreground rounded-md">
                    초청팀 대전 수락 대기중
                  </div>
                ) : data.data.schedule?.status === "REJECTED" ? (
                  <div className="h-12 w-full flex justify-center items-center text-lg font-semibold bg-muted text-muted-foreground rounded-md">
                    상대팀 대전 거절됨
                  </div>
                ) : data.data.schedule?.status === "READY" && dDay > 1 ? (
                  <div className="h-12 w-full flex justify-center items-center text-lg bg-amber-500/5 border border-amber-500/30 text-amber-700 text-medium rounded-md gap-1.5 tracking-tight">
                    경기하는 날까지
                    <span className="text-amber-600 font-extrabold">
                      {calculateDday(data.data.schedule?.date as Date) > 0
                        ? `D-${calculateDday(data.data.schedule?.date as Date)}`
                        : "D-day"}
                    </span>
                    {/* {calculateDday(data.data.schedule?.date as Date) > 0
                      ? `D-${calculateDday(data.data.schedule?.date as Date)}`
                      : "D-day"} */}
                  </div>
                ) : data.data.schedule?.status === "READY" && dDay === 1 ? (
                  <div className="h-12 w-full flex justify-center items-center text-lg font-semibold bg-muted text-muted-foreground rounded-md">
                    내일
                  </div>
                ) : data.data.schedule?.status === "READY" && dDay === 0 ? (
                  <Button
                    className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
                    size="lg"
                  >
                    경기 시작
                  </Button>
                ) : data.data.schedule?.status === "PLAY" ? (
                  <Button
                    className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
                    size="lg"
                  >
                    경기 종료
                  </Button>
                ) : (
                  <div>경기 종료</div>
                )}
              </div>
            </div>

            {/* 탭 */}
            <div className="flex items-center justify-between gap-2 px-4">
              <div className="flex h-12 space-x-2">
                {tabs
                  // .filter(
                  //   (tab) =>
                  //     tab.value !== "management" ||
                  //     (tab.value === "management" &&
                  //       (data.data.currentUserMembership.role === "MANAGER" ||
                  //         data.data.currentUserMembership.role === "OWNER") &&
                  //       data.data.currentUserMembership.status === "APPROVED")
                  // )
                  .map((tab) => (
                    <div
                      key={tab.value}
                      className={`flex justify-center items-center min-w-14 font-semibold text-base px-2 cursor-pointer border-b-4 ${
                        selectedTab === tab.value
                          ? "border-gray-700"
                          : "border-transparent"
                      } ${
                        tab.isDisabled ? "pointer-events-none opacity-50" : ""
                      }`}
                      onClick={() => setSelectedTab(tab.value)}
                    >
                      {tab.label}
                      {/* <div className={` rounded-t-full h-0.5 w-full flex overflow-hidden ${selectedTab === tab.value ? "":""}`} /> */}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 참가자 현황 */}
          <div className="border rounded-2xl overflow-hidden mx-4">
            <div
              className="w-full flex items-center justify-between px-4 py-3 border-b gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => {
                alert("참가자 현황");
              }}
            >
              <div className="flex items-center space-x-3">
                <ChartPie className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">참가자 현황</span>
              </div>
              {/* <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-500">
                  자세히 보기
                </span>
              </div> */}
              <ChevronRight className="size-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-3 gap-3 bg-white rounded-2xl p-4">
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">0</div>
                <Label className="text-muted-foreground">참가</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">1</div>
                <Label className="text-muted-foreground">미정</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">0</div>
                <Label className="text-muted-foreground">불참</Label>
              </div>
            </div>
          </div>

          <div className="">
            {/* 안내 사항 */}
            <div className="mb-3">
              <div className="w-full flex items-center justify-start px-4 py-3 border-t border-gray-100 space-x-3">
                <Text className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">안내 사항</span>
              </div>
              <p className="mx-4 border p-4 bg-white rounded-2xl min-h-40">
                {data?.data.schedule?.description ?? "안내 사항 없음"}
              </p>
            </div>

            {/* 장소 이름 */}
            <div className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 gap-3">
              <div className="flex items-center space-x-3">
                <MapPinSimpleIcon
                  className="text-gray-600 mr-3"
                  size={20}
                  weight="fill"
                />
                <span className="font-medium">장소 이름</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {data.data.schedule?.place}
                </span>
              </div>
            </div>

            {/* 경기 일자 */}
            <div className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 gap-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-medium">경기 일자</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {data.data.schedule?.startTime?.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* 예약 시간 */}
            <div className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 gap-3">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-medium">예약 시간</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {data.data.schedule?.startTime?.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {data.data.schedule?.endTime?.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* 만든이 */}
            <div
              className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => {
                router.push(`/players/${data.data.schedule?.createdBy.id}`);
              }}
            >
              <div className="flex items-center space-x-3">
                <UserRound className="w-5 h-5 text-gray-600" />
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
            만든 날짜:{" "}
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
      ) : null}
    </div>
  );
};

export default ScheduleContent;
