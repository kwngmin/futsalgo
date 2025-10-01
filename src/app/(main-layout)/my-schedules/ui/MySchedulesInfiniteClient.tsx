"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, lazy, Suspense, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ArrowLeft } from "lucide-react";

import { SCHEDULE_FILTER_OPTIONS } from "@/entities/schedule/model/constants";
import { useScheduleFilters } from "../../home/lib/use-schedule-filters";
import ScheduleFilterBar from "@/features/filter-list/ui/ScheduleFilterBar";
import AddScheduleButton from "../../home/ui/AddScheduleButton";
import ScheduleList from "../../home/ui/ScheduleList";
import {
  getMySchedules,
  GetMySchedulesResponse,
} from "../actions/get-my-schedules";
import ListHeader, { TabType } from "@/features/tab-and-search/ui/ListHeader";

const FilterMatchType = lazy(
  () => import("@/features/filter-list/ui/FilterScheduleMatch")
);
const FilterDays = lazy(
  () => import("@/features/filter-list/ui/FilterScheduleDays")
);
const FilterLocation = lazy(
  () => import("@/features/filter-list/ui/FilterLocation")
);
const FilterStartPeriod = lazy(
  () => import("@/features/filter-list/ui/FilterSchedulePeriod")
);

interface Props {
  initialData: GetMySchedulesResponse;
}

const MySchedulesInfiniteClient = ({ initialData }: Props) => {
  const router = useRouter();
  const session = useSession();
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const {
    currentTab,
    searchFocused,
    searchValue,
    openFilter,
    filterValues,
    filters,
    handleSearchChange,
    handleSearchClear,
    handleSearchFocus,
    handleSearchClose,
    handleFilterClose,
    handleFilterChange,
    setOpenFilter,
    setFilterValues,
  } = useScheduleFilters({
    initialSearch: "",
    router,
    defaultTab: "my-schedules",
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["my-schedules", session.data?.user?.id, filters],
      queryFn: ({ pageParam = 1 }) =>
        getMySchedules({
          ...filters,
          page: pageParam,
          pageSize: 20,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage.data?.schedules || lastPage.data.schedules.length < 20) {
          return undefined;
        }
        return allPages.length + 1;
      },
      initialData: {
        pages: [initialData],
        pageParams: [1],
      },
      enabled: !!session.data?.user?.id,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleScheduleCreate = useCallback(() => {
    router.push("/schedule/new");
  }, [router]);

  const handleGoBack = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleMySchedulesTabChange = useCallback(
    (tab: TabType) => {
      if (tab === "schedules") {
        router.push("/");
      }
    },
    [router]
  );

  const allSchedules = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.data?.schedules || []);
  }, [data]);

  const hasManageableTeams =
    data?.pages[0]?.data?.manageableTeams &&
    data.pages[0].data.manageableTeams.length > 0;

  const tabOptions = useMemo(
    () => [
      { tab: "schedules" as const, label: "경기일정" },
      { tab: "my-schedules" as const, label: "내 일정" },
    ],
    []
  );

  // 에러 처리
  if (!initialData.success) {
    return (
      <>
        <div className="flex items-center justify-between px-4 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
              onClick={handleGoBack}
            >
              <ArrowLeft style={{ width: "24px", height: "24px" }} />
            </button>
            <h1 className="text-[1.625rem] font-bold cursor-default">
              내 일정
            </h1>
          </div>
        </div>
        <div className="mx-4 bg-red-50 rounded-2xl px-4 h-20 flex justify-center items-center text-sm text-red-600">
          {initialData.error || "일정을 불러오는 중 오류가 발생했습니다."}
        </div>
      </>
    );
  }

  return (
    <>
      <ListHeader
        tabOptions={tabOptions}
        placeholder="팀 이름 또는 풋살장 검색"
        currentTab={currentTab}
        searchFocused={searchFocused}
        searchValue={searchValue}
        onTabChange={handleMySchedulesTabChange}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        onSearchFocus={handleSearchFocus}
        onSearchClose={handleSearchClose}
        onPlusAction={hasManageableTeams ? handleScheduleCreate : undefined}
      />

      <ScheduleFilterBar
        filterOptions={SCHEDULE_FILTER_OPTIONS}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        filterValues={filterValues}
        setFilterValues={setFilterValues}
      />

      <Suspense fallback={null}>
        {openFilter === "matchType" && (
          <FilterMatchType
            onClose={handleFilterClose}
            setFilterValues={handleFilterChange}
          />
        )}
        {openFilter === "days" && (
          <FilterDays
            onClose={handleFilterClose}
            setFilterValues={handleFilterChange}
          />
        )}
        {openFilter === "location" && (
          <FilterLocation
            onClose={handleFilterClose}
            setFilterValues={handleFilterChange}
          />
        )}
        {openFilter === "startPeriod" && (
          <FilterStartPeriod
            onClose={handleFilterClose}
            setFilterValues={handleFilterChange}
          />
        )}
      </Suspense>

      {hasManageableTeams && (
        <AddScheduleButton onClick={handleScheduleCreate} />
      )}

      <div className="mt-3">
        {allSchedules.map((schedule) => (
          <ScheduleList schedule={schedule} key={schedule.id} />
        ))}

        {allSchedules.length === 0 && (
          <div className="mx-4 bg-neutral-50 rounded-2xl px-4 h-20 flex justify-center items-center text-sm text-muted-foreground">
            소속된 팀의 일정이 없습니다.
          </div>
        )}
      </div>

      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          ) : (
            <div className="text-sm text-muted-foreground">
              스크롤하여 더 보기
            </div>
          )}
        </div>
      )}

      {!hasNextPage && allSchedules.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="text-sm text-muted-foreground">
            모든 일정을 불러왔습니다
          </div>
        </div>
      )}
    </>
  );
};

export default MySchedulesInfiniteClient;
