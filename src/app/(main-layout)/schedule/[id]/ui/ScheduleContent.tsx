"use client";

import { ArrowLeft, EllipsisVertical, Share } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ScheduleAttendance from "./ScheduleAttendance";
import ScheduleDetails from "./ScheduleDetails";
// import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

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
    label: "일정",
    value: "overview",
    isDisabled: false,
  },
  {
    label: "스쿼드",
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
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const validTab = tabs.find((t) => t.value === tab);
  const [selectedTab, setSelectedTab] = useState<string>(
    validTab ? validTab.value : tabs[0].value
  );

  const handleGoBack = () => {
    router.push("/");
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
          {/* <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <BookmarkIcon className="w-5 h-5" />
          </button> */}
          <button
            type="button"
            onClick={() => router.push("/schedule/new")}
            className="shrink-0 h-10 px-4 gap-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer font-semibold"
          >
            {/* <ArchiveBoxIcon className="size-5" strokeWidth={1.75} /> */}
            {/* <Plus className="w-5 h-5" strokeWidth={2} /> */}
            보관하기
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Share className="w-5 h-5" />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <EllipsisVertical className="size-5" />
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-slate-100 flex items-center px-4 h-12">
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
