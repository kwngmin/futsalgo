"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMySchedules } from "./actions/get-my-schedules";
import SchedulePageLoading from "../ui/loading";
import ScheduleList from "../ui/ScheduleList";
import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { ScheduleFilters } from "@/features/filter-list/model/types";
import { DayOfWeek, Period } from "@prisma/client";
import FilterStartPeriod, {
  StartPeriodFilter,
} from "@/features/filter-list/ui/FilterSchedulePeriod";
import FilterDays, {
  DaysFilter,
} from "@/features/filter-list/ui/FilterScheduleDays";
import ScheduleFilterBar from "../../../features/filter-list/ui/ScheduleFilterBar";
import FilterLocation from "@/features/filter-list/ui/FilterLocation";
import FilterMatchType from "@/features/filter-list/ui/FilterScheduleMatch";
import AddScheduleButton from "../ui/AddScheduleButton";
import { SCHEDULE_FILTER_OPTIONS } from "@/entities/schedule/model/constants";
import ListHeader, { TabType } from "@/features/tab-and-search/ui/ListHeader";

const MySchedulesPage = () => {
  const router = useRouter();
  const session = useSession();

  const [currentTab, setCurrentTab] = useState<TabType>("my-schedules");
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

  const handleTabChange = useCallback(
    (tab: TabType) => {
      setCurrentTab(tab);
      if (tab === "schedules") {
        router.push("/");
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-schedules", session.data?.user?.id, filters],
    queryFn: () => getMySchedules(filters),
    placeholderData: keepPreviousData,
    enabled: !!session.data?.user?.id, // 로그인된 경우에만 실행
    staleTime: 1000 * 60 * 2, // 2분간 fresh 상태 유지
    gcTime: 1000 * 60 * 10, // 10분간 가비지 컬렉션 방지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재조회 방지
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
        onPlusAction={
          data?.data?.manageableTeams && data?.data?.manageableTeams.length > 0
            ? () => {
                router.push("/schedule/new");
              }
            : undefined
        }
      />

      {/* 필터 바 */}
      <ScheduleFilterBar
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

      {/* ScheduleList */}
      <div className="mt-3">
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
