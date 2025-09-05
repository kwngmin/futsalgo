"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowDownUp, ArrowLeft, Search } from "lucide-react";
import { getMySchedules } from "./actions/get-my-schedules";
import SchedulePageLoading from "../ui/loading";
import ScheduleList from "../ui/ScheduleList";
import { useState } from "react";

type TabType = "schedules" | "my-schedules";

const MySchedulesPage = () => {
  const router = useRouter();
  const session = useSession();

  const [currentTab, setCurrentTab] = useState<TabType>("my-schedules");

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    if (tab === "schedules") {
      router.push("/");
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-schedules", session.data?.user?.id],
    queryFn: getMySchedules,
    placeholderData: keepPreviousData,
    enabled: !!session.data?.user?.id, // 로그인된 경우에만 실행
  });

  console.log(data, "my-schedules-data");

  const handleGoBack = () => {
    router.push("/");
  };

  if (isLoading) {
    return <SchedulePageLoading isPage isMySchedules />;
  }

  // 로그인하지 않은 경우
  if (!session.data?.user?.id) {
    return (
      <div className="max-w-2xl mx-auto pb-16 flex flex-col">
        <div className="flex items-center justify-between px-4 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
              onClick={handleGoBack}
            >
              <ArrowLeft style={{ width: "24px", height: "24px" }} />
            </button>
            <h1 className="text-2xl font-bold cursor-default">내 일정</h1>
          </div>
        </div>
        <div className="mx-4 bg-neutral-50 rounded-2xl px-4 h-20 flex justify-center items-center text-sm text-muted-foreground">
          로그인 후 내 일정을 확인할 수 있습니다.
        </div>
      </div>
    );
  }

  // 에러 처리
  if (error || !data?.success) {
    return (
      <div className="max-w-2xl mx-auto pb-16 flex flex-col">
        <div className="flex items-center justify-between px-4 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
              onClick={handleGoBack}
            >
              <ArrowLeft style={{ width: "24px", height: "24px" }} />
            </button>
            <h1 className="text-2xl font-bold cursor-default">내 일정</h1>
          </div>
        </div>
        <div className="mx-4 bg-red-50 rounded-2xl px-4 h-20 flex justify-center items-center text-sm text-red-600">
          {data?.error || "일정을 불러오는 중 오류가 발생했습니다."}
        </div>
      </div>
    );
  }

  // const myTeams = data?.data?.myTeams.map((team) => team.id);

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 뒤로가기와 제목, 검색 */}
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
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <ArrowDownUp className="size-5" />
          </button>
        </div>
      </div>

      {/* ScheduleList */}
      <div className="">
        {data.data?.schedules?.map((schedule) => {
          return (
            <ScheduleList
              schedule={schedule}
              key={schedule.id}
              // myTeams={myTeams}
            />
          );
        })}

        {/* 전체 일정이 없는 경우 */}
        {data.data?.schedules?.length === 0 && (
          <div className="mx-4 bg-neutral-50 rounded-2xl px-4 h-20 flex justify-center items-center text-sm text-muted-foreground">
            소속된 팀의 일정이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default MySchedulesPage;
