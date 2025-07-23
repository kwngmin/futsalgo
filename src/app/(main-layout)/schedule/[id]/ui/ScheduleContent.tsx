"use client";

import { ArrowLeft, EllipsisVertical, Share } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ScheduleAttendance from "./ScheduleAttendance";
import ScheduleDetails from "./ScheduleDetails";
import { HeartIcon } from "@phosphor-icons/react";
import { likeSchedule } from "@/app/(main-layout)/actions/like-schedule";
import { useQueryClient } from "@tanstack/react-query";
// import { HeartIcon } from "@heroicons/react/24/outline";

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
    label: "명단",
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
    isDisabled: true,
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
}: {
  scheduleId: string;
  isLikedSchedule?: boolean;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const validTab = tabs.find((t) => t.value === tab);
  const [selectedTab, setSelectedTab] = useState<string>(
    validTab ? validTab.value : tabs[0].value
  );
  const [isLiked, setIsLiked] = useState(isLikedSchedule);

  const handleGoBack = () => {
    router.push("/");
  };

  const handleLikeClick = async (scheduleId: string) => {
    const result = await likeSchedule({ scheduleId });
    console.log(result);
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      // toast.success(result.message);
      setIsLiked(true);
    } else {
      console.warn(result.error);
      // toast.error(result.error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 뒤로 가기와 공유하기, 더보기 버튼 */}
      <div className="grid grid-cols-2 items-center shrink-0 px-4 h-16">
        <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <ArrowLeft
            style={{ width: "24px", height: "24px" }}
            onClick={handleGoBack}
          />
        </button>
        <div className="flex items-center justify-end gap-2">
          {/* <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <BookmarkIcon className="size-5" />
          </button> */}

          {/* <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <HeartIcon className="size-5" strokeWidth={2} />
          </button> */}
          <button
            className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            onClick={() => handleLikeClick(scheduleId)}
          >
            <HeartIcon
              className={`size-6 ${isLiked ? "text-zinc-600" : ""}`} //
              weight={isLiked ? "fill" : "regular"}
            />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Share className="size-5" />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <EllipsisVertical className="size-5" />
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-slate-100 flex items-center px-4 sm:px-2 sm:mx-4 h-12  sm:rounded-full">
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
