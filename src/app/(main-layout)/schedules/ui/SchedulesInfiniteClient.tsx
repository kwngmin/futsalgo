"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, lazy, Suspense, useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { SCHEDULE_FILTER_OPTIONS } from "@/entities/schedule/model/constants";
import ListHeader from "@/features/tab-and-search/ui/ListHeader";

import ScheduleFilterBar from "@/features/filter-list/ui/ScheduleFilterBar";
import { getSchedules, GetSchedulesResponse } from "../actions/get-schedules";
import { useScheduleFilters } from "../lib/use-schedule-filters";
import LoginButton from "./LoginButton";
import AddScheduleButton from "./AddScheduleButton";
import ScheduleSection from "./ScheduleSection";

// 필터 컴포넌트 동적 임포트
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
  initialData: GetSchedulesResponse;
  searchQuery?: string;
}

/**
 * Client Component - 인피니티 스크롤 처리
 */
const SchedulesInfiniteClient = ({ initialData, searchQuery }: Props) => {
  const router = useRouter();
  const session = useSession();
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px", // 뷰포트보다 100px 전에 로딩 시작
  });

  const {
    currentTab,
    searchFocused,
    searchValue,
    openFilter,
    filterValues,
    filters,
    handleTabChange,
    handleSearchChange,
    handleSearchClear,
    handleSearchFocus,
    handleSearchClose,
    handleFilterClose,
    handleFilterChange,
    setOpenFilter,
    setFilterValues,
  } = useScheduleFilters({
    initialSearch: searchQuery ?? "",
    router,
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

  // useInfiniteQuery로 페이지네이션 처리
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ["schedules", session.data?.user?.id, filters],
      queryFn: ({ pageParam = 1 }) =>
        getSchedules({
          ...filters,
          page: pageParam,
          pageSize: 20,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        // 더 가져올 데이터가 있는지 확인
        if (
          !lastPage.data?.pastSchedules ||
          lastPage.data.pastSchedules.length < 20
        ) {
          return undefined; // 더 이상 페이지 없음
        }
        return allPages.length + 1; // 다음 페이지 번호
      },
      // 필터가 없을 때만 초기 데이터 사용
      initialData: !hasActiveFilters
        ? {
            pages: [initialData],
            pageParams: [1],
          }
        : undefined,
      staleTime: 1000 * 60 * 30, // 30분으로 증가
      gcTime: 1000 * 60 * 60, // 1시간으로 증가
      refetchOnWindowFocus: false,
    });

  // 스크롤이 하단에 도달하면 자동으로 다음 페이지 로드
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleScheduleCreate = useCallback(() => {
    router.push("/schedules/new");
  }, [router]);

  // 모든 페이지의 데이터를 병합
  const allSchedules = useMemo(() => {
    if (!data)
      return { todaysSchedules: [], upcomingSchedules: [], pastSchedules: [] };

    return {
      // 첫 페이지의 오늘/예정 일정만 사용
      todaysSchedules: data.pages[0]?.data?.todaysSchedules || [],
      upcomingSchedules: data.pages[0]?.data?.upcomingSchedules || [],
      // 모든 페이지의 과거 일정을 병합
      pastSchedules: data.pages.flatMap(
        (page) => page.data?.pastSchedules || []
      ),
    };
  }, [data]);

  const hasManageableTeams =
    data?.pages[0]?.data?.manageableTeams &&
    data.pages[0].data.manageableTeams.length > 0;
  const isLoggedIn = !!session.data?.user?.id;

  const tabOptions = useMemo(
    () => [
      { tab: "schedules" as const, label: "경기일정" },
      { tab: "my-schedules" as const, label: "내 일정" },
    ],
    []
  );

  return (
    <>
      <ListHeader
        tabOptions={tabOptions}
        placeholder="팀 이름 또는 풋살장 검색"
        currentTab={currentTab}
        searchFocused={searchFocused}
        searchValue={searchValue}
        onTabChange={handleTabChange}
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

      {/* 필터 컴포넌트 - Lazy Loading */}
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

      {!isLoggedIn && <LoginButton />}

      {/* 일정 목록 */}
      <ScheduleSection
        todaysSchedules={allSchedules.todaysSchedules}
        upcomingSchedules={allSchedules.upcomingSchedules}
        pastSchedules={allSchedules.pastSchedules}
        userId={session.data?.user?.id}
        error={undefined}
        isFetching={isFetching}
      />

      {/* 인피니티 스크롤 트리거 */}
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

      {/* 모든 데이터 로드 완료 */}
      {!hasNextPage && allSchedules.pastSchedules.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="text-sm text-muted-foreground">
            모든 일정을 불러왔습니다
          </div>
        </div>
      )}

      {/* 모든 데이터 로드 완료 */}
      {!session.data?.user?.id &&
        !hasNextPage &&
        allSchedules.pastSchedules.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              일정이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">새로운 일정을 추가해보세요</p>
          </div>
        )}
    </>
  );
};

export default SchedulesInfiniteClient;
