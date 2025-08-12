"use client";

import SchedulePageLoading from "@/app/(main-layout)/ui/loading";
import ScheduleCard from "@/app/(main-layout)/ui/ScheduleCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { getTeamSchedules } from "../actions/get-team-schedules";
import { CalendarBlankIcon } from "@phosphor-icons/react";

interface TeamSchedulesProps {
  teamId: string;
}

const TeamSchedules = ({ teamId }: TeamSchedulesProps) => {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["team-schedules", teamId],
    queryFn: ({ pageParam = 0 }) =>
      getTeamSchedules({ teamId, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.success || !lastPage.data?.hasMore) return undefined;
      return lastPage.data.nextPage;
    },
    initialPageParam: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <SchedulePageLoading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-destructive mb-2">
            경기일정을 불러오는데 실패했습니다
          </p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const allSchedules =
    data?.pages.flatMap((page) => page.data?.schedules || []) || [];

  if (allSchedules.length === 0) {
    return (
      <div className="text-center min-h-[50vh] flex flex-col items-center justify-center text-gray-500">
        <CalendarBlankIcon
          className="w-16 h-16 mx-auto mb-4 text-gray-300"
          weight="duotone"
        />
        <p className="text-lg mb-2 font-medium">경기일정이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {allSchedules.map((schedule) => (
        <ScheduleCard key={schedule.id} schedule={schedule} />
      ))}

      {/* 무한스크롤 트리거 */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            경기일정을 불러오는 중...
          </div>
        )}
      </div>

      {/* {!hasNextPage && allSchedules.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          모든 경기일정을 불러왔습니다
        </div>
      )} */}
    </div>
  );
};

export default TeamSchedules;
