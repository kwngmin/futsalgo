"use client";

import { memo } from "react";
import { getSchedules } from "@/app/(main-layout)/home/actions/get-schedules";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { SCHEDULE_FILTER_OPTIONS } from "@/entities/schedule/model/constants";
import ListHeader from "@/features/tab-and-search/ui/ListHeader";
import ScheduleSection from "./ScheduleSection";
import { useScheduleFilters } from "../lib/use-schedule-filters";
import SchedulePageLoading from "./loading";
import ScheduleFilterBar from "@/features/filter-list/ui/ScheduleFilterBar";
import FilterMatchType from "@/features/filter-list/ui/FilterScheduleMatch";
import FilterDays from "@/features/filter-list/ui/FilterScheduleDays";
import FilterLocation from "@/features/filter-list/ui/FilterLocation";
import FilterStartPeriod from "@/features/filter-list/ui/FilterSchedulePeriod";
import AddScheduleButton from "./AddScheduleButton";
import LoginButton from "./LoginButton";

/**
 * 헤더 컴포넌트 메모이제이션
 */
const MemoizedListHeader = memo(ListHeader);
const MemoizedScheduleSection = memo(ScheduleSection);

/**
 * 일정 목록 컨테이너 - 최적화 버전
 */
const SchedulesContainer = () => {
  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();

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
  } = useScheduleFilters(searchParams.get("search") || "", router);

  const { data, isLoading, error } = useQuery({
    queryKey: ["schedules", session.data?.user?.id, filters],
    queryFn: () => getSchedules(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  if (isLoading && !data) {
    return <SchedulePageLoading isPage />;
  }

  const hasManageableTeams =
    data?.data?.manageableTeams && data.data.manageableTeams.length > 0;
  const isLoggedIn = !!session.data?.user?.id;
  const handleScheduleCreate = () => router.push("/schedule/new");

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <MemoizedListHeader
        tabOptions={[
          { tab: "schedules", label: "경기일정" },
          { tab: "my-schedules", label: "내 일정" },
        ]}
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

      {hasManageableTeams && (
        <AddScheduleButton onClick={handleScheduleCreate} />
      )}

      {!isLoggedIn && <LoginButton />}

      <MemoizedScheduleSection
        todaysSchedules={data?.data?.todaysSchedules}
        upcomingSchedules={data?.data?.upcomingSchedules}
        pastSchedules={data?.data?.pastSchedules}
        userId={session.data?.user?.id}
        error={error}
      />
    </div>
  );
};

export default SchedulesContainer;
