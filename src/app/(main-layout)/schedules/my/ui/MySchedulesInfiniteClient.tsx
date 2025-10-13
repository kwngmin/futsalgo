"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, lazy, Suspense, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ArrowLeft } from "lucide-react";

import { SCHEDULE_FILTER_OPTIONS } from "@/entities/schedule/model/constants";
import { useScheduleFilters } from "../../lib/use-schedule-filters";
import ScheduleFilterBar from "@/features/filter-list/ui/ScheduleFilterBar";
import AddScheduleButton from "../../ui/AddScheduleButton";
import ScheduleList from "../../ui/ScheduleList";
import {
  getMySchedules,
  GetMySchedulesResponse,
} from "../actions/get-my-schedules";
import ListHeader, { TabType } from "@/features/tab-and-search/ui/ListHeader";
import Link from "next/link";
import { SmileyXEyesIcon } from "@phosphor-icons/react";

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

  // 필터가 적용되었는지 확인
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.searchQuery ||
        filters.matchType ||
        filters.days ||
        filters.startPeriod ||
        filters.city
    );
  }, [filters]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
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
      // 필터가 없을 때만 초기 데이터 사용
      initialData: !hasActiveFilters
        ? {
            pages: [initialData],
            pageParams: [1],
          }
        : undefined,
      enabled: !!session.data?.user?.id,
      staleTime: 1000 * 60 * 30, // 30분으로 증가
      gcTime: 1000 * 60 * 60, // 1시간으로 증가
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleScheduleCreate = useCallback(() => {
    router.push("/schedules/new");
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
            <Link
              href="/"
              className="shrink-0 size-10 flex items-center justify-center text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft style={{ width: "24px", height: "24px" }} />
            </Link>
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

      {hasManageableTeams && <AddScheduleButton />}

      <div className="mt-3">
        {allSchedules.map((schedule) => (
          <ScheduleList schedule={schedule} key={schedule.id} />
        ))}

        {isFetching && (
          <div className="px-4">
            {Array.from({ length: 10 }).map((_, index) => {
              return (
                <div key={index} className="flex items-center gap-3 py-2">
                  <div className="size-14 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                  <div className="grow flex flex-col gap-2">
                    <div className="w-48 h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="w-32 h-5 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="size-10 flex items-center justify-center">
                    <div className="size-6 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isFetching && allSchedules.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            {/* <div className="w-16 h-16 mx-auto text-gray-300 mb-4" /> */}
            <SmileyXEyesIcon
              className="size-28 mx-auto text-gray-200 mb-4"
              weight="fill"
            />
            <h3 className="text-lg font-medium text-gray-900">
              경기가 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              경기를 추가하고 골과 어시스트를 기록하세요
            </p>
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
