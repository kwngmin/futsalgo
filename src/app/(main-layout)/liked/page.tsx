"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowDownUp, Plus, Search } from "lucide-react";
import ScheduleCard from "../ui/ScheduleCard";
import { getLikedSchedules } from "./actions/get-liked-schedules";

const LikedPage = () => {
  const router = useRouter();
  const session = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["liked-schedules", session.data?.user?.id],
    queryFn: getLikedSchedules,
    placeholderData: keepPreviousData,
  });

  console.log(data, "data");
  console.log(isLoading, "isLoading");
  console.log(error, "error");

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1
            className="text-2xl font-bold opacity-30"
            onClick={() => router.push("/")}
          >
            경기
          </h1>
          {/* <h1 className="text-2xl font-bold opacity-30">북마크</h1> */}
          <h1 className="text-2xl font-bold">좋아요</h1>
          {/* <h1 className="text-2xl font-bold opacity-30">보관함</h1> */}
        </div>
        <div className="flex items-center gap-2">
          {Array.isArray(data?.data?.manageableTeams) &&
            data?.data?.manageableTeams.length > 0 && (
              <button
                type="button"
                onClick={() => router.push("/schedule/new")}
                className="shrink-0 h-9 pl-2 pr-3 gap-1 flex items-center justify-center bg-black text-white hover:bg-black/80 rounded-full transition-colors cursor-pointer font-semibold"
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
                일정
              </button>
            )}
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Search className="w-5 h-5" />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <ArrowDownUp className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* MatchesPage */}
      <div className="">
        {/* 좋아요 한 경기 */}
        {data?.data?.likedSchedules?.map((schedule) => {
          return <ScheduleCard schedule={schedule} key={schedule.id} />;
        })}
      </div>
    </div>
  );
};

export default LikedPage;
