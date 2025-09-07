"use client";

import { getSchedules } from "@/app/(main-layout)/home/actions/get-schedules";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Search } from "lucide-react";
import ScheduleList from "./ui/ScheduleList";
import SchedulePageLoading from "./ui/loading";
import { Separator } from "@/shared/components/ui/separator";
import { useState } from "react";
// import {
//   HandsClappingIcon,
//   HandshakeIcon,
//   MoonIcon,
//   SlidersHorizontalIcon,
//   SunIcon,
// } from "@phosphor-icons/react";

type TabType = "schedules" | "my-schedules";

const HomePage = () => {
  const router = useRouter();
  const session = useSession();
  const [currentTab, setCurrentTab] = useState<TabType>("schedules");

  const { data, isLoading, error } = useQuery({
    queryKey: ["schedules", session.data?.user?.id],
    queryFn: getSchedules,
    placeholderData: keepPreviousData,
  });

  console.log(data, "data");

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    if (tab === "my-schedules") {
      router.push("/my-schedules");
    }
  };

  if (isLoading) {
    return <SchedulePageLoading isPage />;
  }

  // const myTeams = data?.data?.myTeams.map((team) => team.id);

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1
            className={`text-2xl font-bold cursor-pointer transition-opacity ${
              currentTab === "schedules" ? "" : "opacity-30 hover:opacity-50"
            }`}
            onClick={() => handleTabChange("schedules")}
          >
            경기일정
          </h1>
          <h1
            className={`text-2xl font-bold cursor-pointer transition-opacity ${
              currentTab === "my-schedules" ? "" : "opacity-30 hover:opacity-50"
            }`}
            onClick={() => handleTabChange("my-schedules")}
          >
            내 일정
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Search className="size-5" />
          </button>
          {/* <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <ArrowDownUp className="size-5" />
          </button> */}
          {/* {Array.isArray(data?.data?.manageableTeams) &&
            data?.data?.manageableTeams.length > 0 && (
              <button
                type="button"
                onClick={() => router.push("/schedule/new")}
                className="shrink-0 size-10 flex items-center justify-center bg-black text-white hover:bg-black/80 rounded-full transition-colors cursor-pointer font-semibold"
              >
                <Plus className="size-5" strokeWidth={2} />
              </button>
            )} */}
        </div>
      </div>

      {/* 필터 */}
      {/* <div className="flex items-center gap-3 select-none mb-3 relative">
        <div className="absolute right-0 top-0 w-8 h-10 bg-gradient-to-l from-white to-transparent" />
        <div className="shrink-0 size-10 flex items-center justify-center ml-4 rounded-full cursor-pointer hover:bg-gray-100 active:scale-95 active:bg-gray-200">
          <SlidersHorizontalIcon className="size-6" />
        </div>
        <div className="grow overflow-hidden h-9 sm:h-8 flex items-start border-l border-gray-300">
          <div className="w-full pl-3 pr-8 overflow-y-hidden overflow-x-scroll scroll-ml-4 flex gap-1.5">
            <div className="sm:text-sm font-medium border border-gray-400 bg-gray-50 hover:bg-gray-200/80 active:bg-gray-200 pl-3 sm:pl-2 pr-3.5 sm:pr-2.5 h-9 sm:h-8 flex items-center gap-1.5 justify-center rounded-full cursor-pointer active:scale-95 shrink-0">
              <HandsClappingIcon
                className="size-5 text-purple-700"
                weight="fill"
              />
              자체전
            </div>
            <div className="sm:text-sm font-medium border border-gray-400 bg-gray-50 hover:bg-gray-200/80 active:bg-gray-200 pl-3 sm:pl-2 pr-3.5 sm:pr-2.5 h-9 sm:h-8 flex items-center gap-1.5 justify-center rounded-full cursor-pointer active:scale-95 shrink-0">
              <HandshakeIcon className="size-5 text-blue-700" weight="fill" />
              친선전
            </div>
            <div className="sm:text-sm font-medium border border-gray-400 bg-gray-50 hover:bg-gray-200/80 active:bg-gray-200 pl-3 sm:pl-2 pr-3.5 sm:pr-2.5 h-9 sm:h-8 flex items-center gap-1.5 justify-center rounded-full cursor-pointer active:scale-95 shrink-0">
              <SunIcon className="size-5 text-red-500" weight="fill" />
              오전
            </div>
            <div className="sm:text-sm font-medium border border-gray-400 bg-gray-50 hover:bg-gray-200/80 active:bg-gray-200 pl-3 sm:pl-2 pr-3.5 sm:pr-2.5 h-9 sm:h-8 flex items-center gap-1.5 justify-center rounded-full cursor-pointer active:scale-95 shrink-0">
              <MoonIcon className="size-5 text-yellow-500" weight="fill" />
              오후
            </div>
          </div>
        </div>
      </div> */}

      {/* 새로운 일정 추가 버튼 */}
      {Array.isArray(data?.data?.manageableTeams) &&
        data?.data?.manageableTeams.length > 0 && (
          <button
            type="button"
            onClick={() => router.push("/schedule/new")}
            className="fixed bottom-[58px] sm:bottom-16 md:left-20 lg:left-72 md:bottom-0 left-0 right-0 sm:max-w-2xs md:max-w-2xl mx-auto shrink-0 h-14 sm:h-10 md:h-11 flex items-center justify-between bg-indigo-600 text-white hover:bg-indigo-800 rounded-t-3xl sm:rounded-full md:rounded-b-none md:rounded-t-2xl transition-colors cursor-pointer font-semibold z-20 px-4 sm:px-2 md:px-3 active:bg-black"
          >
            <div className="flex items-center justify-center gap-3 sm:gap-2">
              <div className="shrink-0 size-7 sm:size-6 flex items-center justify-center bg-white text-indigo-700 rounded-full">
                <Plus className="size-5" strokeWidth={2.5} />
              </div>
              <span className="sm:text-sm font-semibold">새로운 일정 추가</span>
            </div>
            <ChevronRight className="size-6 opacity-80" strokeWidth={2} />
          </button>
        )}

      {/* ScheduleList */}
      <div>
        {Array.isArray(data?.data?.todaysSchedules) &&
          data?.data?.todaysSchedules?.length > 0 && (
            <div className="flex items-center gap-2 mt-4 first:mt-0 overflow-hidden px-5 h-8">
              <div className="size-2 bg-red-500 rounded-full" />
              <div className="text-sm sm:text-xs font-medium text-muted-foreground shrink-0">
                오늘 일정
              </div>
              <Separator className="min-w-20 grow data-[orientation=horizontal]:w-auto" />
            </div>
          )}
        {/* 오늘 경기 */}
        {data?.data?.todaysSchedules?.map((schedule) => {
          return (
            <ScheduleList
              schedule={schedule}
              key={schedule.id}
              // myTeams={myTeams}
            />
          );
        })}

        {/* 예정된 경기 */}
        {Array.isArray(data?.data?.upcomingSchedules) &&
          data?.data?.upcomingSchedules?.length > 0 && (
            <div className="flex items-center gap-2 mt-4 first:mt-0 overflow-hidden px-5 h-8">
              <div className="size-2 bg-amber-500 rounded-full" />
              <div className="text-sm sm:text-xs font-medium text-muted-foreground shrink-0">
                예정된 일정
              </div>
              <Separator className="min-w-20 grow data-[orientation=horizontal]:w-auto" />
            </div>
          )}
        {data?.data?.upcomingSchedules?.map((schedule) => {
          return (
            <ScheduleList
              schedule={schedule}
              key={schedule.id}
              // myTeams={myTeams}
            />
          );
        })}

        {/* 예정된 일정이 없는 경우 */}
        {session.data?.user?.id &&
          data?.data?.todaysSchedules?.length === 0 &&
          data?.data?.upcomingSchedules?.length === 0 && (
            <div className="mx-4 bg-neutral-50 rounded-2xl px-4 h-14 flex justify-center items-center text-sm text-muted-foreground">
              예정된 경기가 없습니다.
            </div>
          )}

        {/* 지난 경기 구분선 */}
        {session.data?.user?.id &&
          data?.data?.pastSchedules &&
          data.data.pastSchedules.length > 0 && (
            <div className="flex items-center gap-2 mt-4 first:mt-0 overflow-hidden px-5 h-8">
              <div className="size-2 bg-gray-400 rounded-full" />
              <div className="text-sm sm:text-xs font-medium text-muted-foreground shrink-0">
                지난 일정
              </div>
              <Separator className="min-w-20 grow data-[orientation=horizontal]:w-auto" />
            </div>
          )}

        {/* 지난 경기 */}
        {data?.data?.pastSchedules?.map((schedule) => {
          return (
            <ScheduleList
              schedule={schedule}
              key={schedule.id}
              // myTeams={myTeams}
            />
          );
        })}

        {error && (
          <div className="mx-4 bg-red-50 rounded-2xl px-4 h-14 flex justify-center items-center text-sm text-red-600">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
