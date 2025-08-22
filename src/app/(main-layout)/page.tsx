"use client";

import { getSchedules } from "@/app/(main-layout)/home/actions/get-schedules";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowDownUp, Plus, Search } from "lucide-react";
import ScheduleCard from "./ui/ScheduleCard";
import SchedulePageLoading from "./ui/loading";
import { Separator } from "@/shared/components/ui/separator";

const HomePage = () => {
  const router = useRouter();
  const session = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["schedules", session.data?.user?.id],
    queryFn: getSchedules,
    placeholderData: keepPreviousData,
  });

  console.log(data, "data");

  if (isLoading) {
    return <SchedulePageLoading isPage />;
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1 className="text-2xl font-bold cursor-default">경기일정</h1>
          <h1
            className="text-2xl font-bold opacity-30 cursor-pointer"
            onClick={() => router.push("/my-schedules")}
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
          {Array.isArray(data?.data?.manageableTeams) &&
            data?.data?.manageableTeams.length > 0 && (
              <button
                type="button"
                onClick={() => router.push("/schedule/new")}
                className="shrink-0 size-10 flex items-center justify-center bg-black text-white hover:bg-black/80 rounded-full transition-colors cursor-pointer font-semibold"
              >
                <Plus className="size-5" strokeWidth={2} />
              </button>
            )}
        </div>
      </div>
      {/* ScheduleList */}
      <div className="">
        {/* 오늘 경기 */}
        {data?.data?.todaysSchedules?.map((schedule) => {
          return <ScheduleCard schedule={schedule} key={schedule.id} />;
        })}
        {/* 예정된 경기 */}
        {data?.data?.upcomingSchedules?.map((schedule) => {
          return <ScheduleCard schedule={schedule} key={schedule.id} />;
        })}
        {data?.data?.todaysSchedules?.length === 0 &&
          data?.data?.upcomingSchedules?.length === 0 && (
            <div className="mx-4 bg-neutral-50 rounded-2xl px-4 h-14 flex justify-center items-center text-sm text-muted-foreground">
              예정된 경기가 없습니다.
            </div>
          )}
        {/* 지난 경기 */}
        {session.data?.user?.id && (
          <div className="flex items-center gap-2 mt-4 overflow-hidden px-4 relative h-6">
            <div className="absolute left-0 bg-white px-4 text-sm text-muted-foreground font-semibold shrink-0">
              지난 일정
            </div>
            <Separator />
          </div>
        )}
        {data?.data?.pastSchedules?.map((schedule) => {
          return <ScheduleCard schedule={schedule} key={schedule.id} />;
        })}
        {error && <div className="text-red-500">{error.message}</div>}
      </div>
    </div>
  );
};

export default HomePage;
