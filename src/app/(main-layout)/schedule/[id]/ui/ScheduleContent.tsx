"use client";

import { ArrowLeft, BookmarkIcon, EllipsisVertical, Share } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ScheduleAttendance from "./ScheduleAttendance";
import ScheduleDetails from "./ScheduleDetails";

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
    label: "경기 일정",
    value: "overview",
    isDisabled: false,
  },
  {
    label: "참석 인원",
    value: "attendance",
    isDisabled: false,
  },
  {
    label: "MVP",
    value: "mvp",
    isDisabled: true,
  },
  {
    label: "댓글",
    value: "comments",
    isDisabled: true,
  },
  // {
  //   label: "후기",
  //   value: "reviews",
  //   isDisabled: true,
  // },
  {
    label: "사진",
    value: "photos",
    isDisabled: true,
  },
];

const ScheduleContent = ({ scheduleId }: { scheduleId: string }) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>(tabs[1].value);

  const handleGoBack = () => {
    router.back();
  };

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

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 뒤로 가기와 공유하기, 더보기 버튼 */}
      <div className="grid grid-cols-2 items-center shrink-0 px-3 h-16">
        <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <ArrowLeft
            style={{ width: "24px", height: "24px" }}
            onClick={handleGoBack}
          />
        </button>
        <div className="flex items-center justify-end gap-2">
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <BookmarkIcon className="w-5 h-5" />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Share className="w-5 h-5" />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <EllipsisVertical className="size-5" />
          </button>
        </div>
      </div>

      {/* 경기 일정 및 상태 보기 */}
      {/* <div className="h-9 flex items-center justify-center bg-slate-100 text-muted-foreground text-sm font-semibold">
        {calculateDday(data.data.schedule?.date as Date) > 1
          ? `경기하는 날까지 D-${calculateDday(
              data.data.schedule?.date as Date
            )}`
          : data.data.schedule?.status === "READY" && dDay === 1
          ? "내일"
          : data.data.schedule?.status === "READY" && dDay === 0
          ? "준비"
          : data.data.schedule?.status === "PLAY"
          ? "경기 중"
          : "경기 종료"}
      </div> */}

      {/* 탭 */}
      <div className="bg-slate-200 flex h-12 border-t border-slate-700">
        {tabs.map((tab) => (
          <div
            key={tab.value}
            className={`flex justify-center items-center font-semibold text-base px-4 cursor-pointer ${
              selectedTab === tab.value ? "bg-black text-white" : ""
            } ${tab.isDisabled ? "pointer-events-none opacity-50" : ""}`}
            onClick={() => setSelectedTab(tab.value)}
          >
            {tab.label}
            {/* <div className={` rounded-t-full h-0.5 w-full flex overflow-hidden ${selectedTab === tab.value ? "":""}`} /> */}
          </div>
        ))}
      </div>

      {/* 참석 인원 탭 내용 */}
      {selectedTab === "attendance" && (
        <ScheduleAttendance scheduleId={scheduleId} />
      )}

      {selectedTab === "overview" && (
        <ScheduleDetails scheduleId={scheduleId} />
      )}
    </div>
  );
};

export default ScheduleContent;
