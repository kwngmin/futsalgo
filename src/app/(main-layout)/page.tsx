"use client";

import { getSchedules } from "@/app/(main-layout)/home/actions/get-schedules";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";

// 컴포넌트별 분리
import Header from "./ui/Header";
import FilterBar from "./ui/FilterBar";
import ScheduleSection from "./ui/ScheduleSection";
import AddScheduleButton from "./ui/AddScheduleButton";
import SchedulePageLoading from "./ui/loading";
import FilterMatchType from "./ui/FilterMatchType";
import FilterDays from "./ui/FilterDays";
// import FilterLocation from "./ui/FilterLocation";
import FilterTime from "./ui/FilterTime";

type TabType = "schedules" | "my-schedules";

const HomePage = () => {
  const router = useRouter();
  const session = useSession();

  // 상태 관리
  const [currentTab, setCurrentTab] = useState<TabType>("schedules");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [openFilter, setOpenFilter] = useState<
    null | "matchType" | "days" | "location" | "time"
  >(null);
  const [filterValues, setFilterValues] = useState<{
    matchType?: { value: "TEAM" | "SQUAD"; label: string };
    days?: {
      mon: boolean;
      tue: boolean;
      wed: boolean;
      thu: boolean;
      fri: boolean;
      sat: boolean;
      sun: boolean;
      label: string;
    };
    location?: { city: string; district: string; label: string };
    time?: { startTime: string; endTime: string; label: string };
  }>({
    matchType: undefined,
    days: undefined,
    location: undefined,
    time: undefined,
  });

  // 디바운스된 검색어
  const debouncedSearchValue = useDebounce(searchValue, 500);

  // 데이터 조회 - 최적화된 설정
  const { data, isLoading, error } = useQuery({
    queryKey: ["schedules", session.data?.user?.id, debouncedSearchValue],
    queryFn: () => getSchedules(debouncedSearchValue),
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
      <Header
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
      {/* {openFilter === "location" && (
        <FilterLocation
          onClose={() => setOpenFilter(null)}
          setFilterValues={setFilterValues}
        />
      )} */}
      {openFilter === "time" && (
        <FilterTime
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
