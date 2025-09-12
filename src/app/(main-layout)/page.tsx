"use client";

import { getSchedules } from "@/app/(main-layout)/home/actions/get-schedules";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";

// 컴포넌트별 분리
import FilterBar from "../../features/filter-list/ui/FilterBar";
import ScheduleSection from "./ui/ScheduleSection";
import AddScheduleButton from "./ui/AddScheduleButton";
import SchedulePageLoading from "./ui/loading";
import FilterMatchType from "../../features/filter-list/ui/FilterMatchType";
import FilterDays, {
  DaysFilter,
} from "../../features/filter-list/ui/FilterDays";
import { DayOfWeek, Period } from "@prisma/client";
import FilterStartPeriod, {
  StartPeriodFilter,
} from "../../features/filter-list/ui/FilterStartPeriod";
import FilterLocation from "../../features/filter-list/ui/FilterLocation";
import { ScheduleFilters } from "@/features/filter-list/model/types";
import { SCHEDULE_FILTER_OPTIONS } from "@/entities/schedule/model/constants";
import ListHeader, { TabType } from "@/features/tab-and-search/ui/ListHeader";

const HomePage = () => {
  const router = useRouter();
  const session = useSession();

  // 상태 관리
  const [currentTab, setCurrentTab] = useState<TabType>("schedules");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  // 디바운스된 검색어
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const [openFilter, setOpenFilter] = useState<
    null | "matchType" | "days" | "location" | "startPeriod"
  >(null);
  const [filterValues, setFilterValues] = useState<{
    matchType?: { value: "TEAM" | "SQUAD"; label: string };
    days?: {
      [DayOfWeek.MONDAY]: boolean;
      [DayOfWeek.TUESDAY]: boolean;
      [DayOfWeek.WEDNESDAY]: boolean;
      [DayOfWeek.THURSDAY]: boolean;
      [DayOfWeek.FRIDAY]: boolean;
      [DayOfWeek.SATURDAY]: boolean;
      [DayOfWeek.SUNDAY]: boolean;
      label: string;
    };
    location?: { city: string; district?: string; label: string };
    startPeriod?: StartPeriodFilter;
  }>({
    matchType: undefined,
    days: undefined,
    location: undefined,
    startPeriod: undefined,
  });

  // DaysFilter를 DayOfWeek 배열로 변환하는 헬퍼 함수
  const convertDaysFilterToArray = useCallback(
    (daysFilter: DaysFilter): DayOfWeek[] => {
      return Object.entries(daysFilter)
        .filter(([key, value]) => key !== "label" && value === true)
        .map(([key]) => key as DayOfWeek);
    },
    []
  );

  // StartPeriodFilter를 Period 배열로 변환하는 헬퍼 함수
  const convertStartPeriodFilterToArray = useCallback(
    (startPeriodFilter: StartPeriodFilter): Period[] => {
      return Object.entries(startPeriodFilter)
        .filter(([key, value]) => key !== "label" && value === true)
        .map(([key]) => key as Period);
    },
    []
  );

  // 필터 객체 생성 - 메모이제이션
  const filters = useMemo<ScheduleFilters>(() => {
    const filterObj: ScheduleFilters = {
      searchQuery: debouncedSearchValue,
    };

    // matchType 필터
    if (filterValues.matchType) {
      filterObj.matchType = filterValues.matchType.value;
    }

    // days 필터 - 배열 방식으로 변경
    if (filterValues.days) {
      const selectedDays = convertDaysFilterToArray(filterValues.days);

      // 선택된 요일이 있을 때만 필터 추가
      if (selectedDays.length > 0 && selectedDays.length < 7) {
        filterObj.days = selectedDays;
      }
      // 모든 요일이 선택되었거나 아무것도 선택되지 않았으면 필터를 추가하지 않음
    }

    // startPeriod 필터 - 배열 방식으로 변경
    if (filterValues.startPeriod) {
      const selectedPeriods = convertStartPeriodFilterToArray(
        filterValues.startPeriod
      );

      // 선택된 시간대가 있을 때만 필터 추가
      if (selectedPeriods.length > 0 && selectedPeriods.length < 5) {
        filterObj.startPeriod = selectedPeriods;
      }
      // 모든 요일이 선택되었거나 아무것도 선택되지 않았으면 필터를 추가하지 않음
    }

    if (filterValues.location) {
      filterObj.city = filterValues.location.city;
      filterObj.district = filterValues.location.district;
    }

    return filterObj;
  }, [
    debouncedSearchValue,
    filterValues,
    convertDaysFilterToArray,
    convertStartPeriodFilterToArray,
  ]);

  // 데이터 조회 - 최적화된 설정
  const { data, isLoading, error } = useQuery({
    queryKey: ["schedules", session.data?.user?.id, filters],
    queryFn: () => getSchedules(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2분간 fresh 상태 유지
    gcTime: 1000 * 60 * 10, // 10분간 가비지 컬렉션 방지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재조회 방지
  });

  // 핸들러 함수들을 useCallback으로 메모이제이션
  const handleTabChange = useCallback(
    (tab: TabType) => {
      setCurrentTab(tab);
      if (tab === "my-schedules") {
        router.push("/my-schedules");
      }
    },
    [router]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchValue("");
  }, []);

  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchFocused(false);
    setSearchValue("");
  }, []);

  if (isLoading && !data) {
    return <SchedulePageLoading isPage />;
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 헤더 - 메모이제이션되어 data 변경 시 리렌더링 안 됨 */}
      {/* <ScheduleHeader
        currentTab={currentTab}
        searchFocused={searchFocused}
        searchValue={searchValue}
        onTabChange={handleTabChange}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        onSearchFocus={handleSearchFocus}
        onSearchClose={handleSearchClose}
      /> */}
      <ListHeader
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
      />

      {/* 필터 바 */}
      <FilterBar
        filterOptions={SCHEDULE_FILTER_OPTIONS}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        filterValues={filterValues}
        setFilterValues={setFilterValues}
      />

      {/* 필터 내용 */}
      {openFilter === "matchType" && (
        <FilterMatchType
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}
      {openFilter === "days" && (
        <FilterDays
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}
      {openFilter === "location" && (
        <FilterLocation
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}
      {openFilter === "startPeriod" && (
        <FilterStartPeriod
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}

      {/* 새로운 일정 추가 버튼 */}
      {data?.data?.manageableTeams && data.data.manageableTeams.length > 0 && (
        <AddScheduleButton onClick={() => router.push("/schedule/new")} />
      )}

      {/* 일정 섹션들 */}
      <ScheduleSection
        todaysSchedules={data?.data?.todaysSchedules}
        upcomingSchedules={data?.data?.upcomingSchedules}
        pastSchedules={data?.data?.pastSchedules}
        userId={session.data?.user?.id}
        error={error}
      />
    </div>
  );
};

export default HomePage;
