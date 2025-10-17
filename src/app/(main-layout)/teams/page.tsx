"use client";

import { lazy, useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getTeams, type GetTeamsResponse } from "./model/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SkeletonContent from "./ui/SkeletonTeamContent";
import TeamList from "./ui/TeamList";
import ListHeader, {
  TabType,
} from "../../../features/tab-and-search/ui/ListHeader";
import RegisterTeamButton from "./ui/RegisterTeamButton";
import TeamFilterBar, {
  TeamFilterType,
  TeamFilterValues,
} from "@/features/filter-list/ui/TeamFilterBar";
import { TEAM_FILTER_OPTIONS } from "@/entities/team/model/constants";
import { TeamLevel } from "@prisma/client";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useInView } from "react-intersection-observer";
import { Separator } from "@/shared/components/ui/separator";
import { TeamLevelFilter } from "@/features/filter-list/ui/FilterTeamLevel";
import { TeamFilters } from "@/features/filter-list/model/types";
import { SmileyXEyesIcon } from "@phosphor-icons/react";
import { createEntityQueryKey } from "@/shared/lib/query-key-utils";

// 필터 컴포넌트 동적 임포트
const FilterTeamGender = lazy(
  () => import("@/features/filter-list/ui/FilterTeamGender")
);
const FilterLocation = lazy(
  () => import("@/features/filter-list/ui/FilterLocation")
);
const FilterTeamRecruitment = lazy(
  () => import("@/features/filter-list/ui/FilterTeamRecruitment")
);
const FilterTeamMatchAvailable = lazy(
  () => import("@/features/filter-list/ui/FilterTeamMatchAvailable")
);
const FilterTeamHasFormerPro = lazy(
  () => import("@/features/filter-list/ui/FilterTeamHasFormerPro")
);
const FilterTeamLevel = lazy(
  () => import("@/features/filter-list/ui/FilterTeamLevel")
);

const TeamsPage = () => {
  const router = useRouter();
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";

  const [currentTab, setCurrentTab] = useState<TabType>("teams");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  // 디바운스된 검색어
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const [openFilter, setOpenFilter] = useState<TeamFilterType>(null);
  const [filterValues, setFilterValues] = useState<TeamFilterValues>({
    gender: undefined,
    location: undefined,
    recruitment: undefined,
    teamMatchAvailable: undefined,
    teamLevel: undefined,
    hasFormerPro: undefined,
  });

  // TeamLevelFilter를 TeamLevel 배열로 변환하는 헬퍼 함수
  const convertTeamLevelFilterToArray = useCallback(
    (teamLevelFilter: TeamLevelFilter): TeamLevel[] => {
      return Object.entries(teamLevelFilter)
        .filter(([key, value]) => key !== "label" && value === true)
        .map(([key]) => key as TeamLevel);
    },
    []
  );

  // 필터 객체 생성 - 메모이제이션
  const filters = useMemo<TeamFilters>(() => {
    const filterObj: TeamFilters = {
      searchQuery: debouncedSearchValue,
    };

    // gender 필터
    if (filterValues.gender) {
      filterObj.gender = filterValues.gender.value;
    }

    // teamLevel 필터 - 배열 방식으로 변경
    if (filterValues.teamLevel) {
      const selectedTeamLevels = convertTeamLevelFilterToArray(
        filterValues.teamLevel
      );

      // 선택된 팀 레벨이 있을 때만 필터 추가
      if (selectedTeamLevels.length > 0 && selectedTeamLevels.length < 5) {
        filterObj.teamLevel = selectedTeamLevels;
      }
      // 모든 팀 레벨이 선택되었거나 아무것도 선택되지 않았으면 필터를 추가하지 않음
    }

    // location 필터
    if (filterValues.location) {
      filterObj.city = filterValues.location.city;
      filterObj.district = filterValues.location.district;
    }

    // recruitment 필터
    if (filterValues.recruitment) {
      filterObj.recruitment = filterValues.recruitment.value;
    }

    // teamMatchAvailable 필터
    if (filterValues.teamMatchAvailable) {
      filterObj.teamMatchAvailable = filterValues.teamMatchAvailable.value;
      console.log("filterObj.teamMatchAvailable", filterObj.teamMatchAvailable);
    }

    // hasFormerPro 필터
    if (filterValues.hasFormerPro) {
      filterObj.hasFormerPro = filterValues.hasFormerPro.value === "TRUE";
    }

    return filterObj;
  }, [debouncedSearchValue, filterValues, convertTeamLevelFilterToArray]);

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    if (tab === "following") {
      router.push("/teams/following");
    }
  };

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

  // 인피니티 쿼리 사용
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<
    GetTeamsResponse,
    Error,
    InfiniteData<GetTeamsResponse>,
    string[],
    number
  >({
    queryKey: createEntityQueryKey(
      "teams",
      "all",
      filters as Record<string, unknown>
    ),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getTeams(pageParam, filters),
    getNextPageParam: (lastPage) => {
      if (lastPage?.success && lastPage.data?.hasMore) {
        return lastPage.data.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Intersection Observer를 사용한 무한 스크롤
  const { ref: loadMoreRef } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 모든 페이지의 데이터를 합치기 (메모이제이션 적용)
  const allTeams = useMemo(
    () =>
      data?.pages.flatMap((page) =>
        page?.success && page.data?.teams ? page.data.teams : []
      ) || [],
    [data?.pages]
  );

  // 내 팀들은 첫 번째 페이지에서만 가져옴
  const myTeams =
    data?.pages?.[0]?.success && data.pages[0].data?.myTeams
      ? data.pages[0].data.myTeams
      : [];

  if (error) {
    console.warn(error);
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 헤더 - 메모이제이션되어 data 변경 시 리렌더링 안 됨 */}
      <ListHeader
        tabOptions={[
          { tab: "teams", label: "팀" },
          { tab: "following", label: "팔로잉" },
        ]}
        placeholder="팀 이름 검색"
        currentTab={currentTab}
        searchFocused={searchFocused}
        searchValue={searchValue}
        onTabChange={handleTabChange}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        onSearchFocus={handleSearchFocus}
        onSearchClose={handleSearchClose}
        onPlusAction={
          isLoggedIn && Array.isArray(myTeams) && myTeams.length < 6
            ? () => {
                router.push("/teams/create");
              }
            : undefined
        }
      />

      {/* 필터 바 */}
      <TeamFilterBar
        filterOptions={TEAM_FILTER_OPTIONS}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        filterValues={filterValues}
        setFilterValues={setFilterValues}
      />
      {/* 필터 내용 */}
      {openFilter === "gender" && (
        <FilterTeamGender
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
      {openFilter === "recruitment" && (
        <FilterTeamRecruitment
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}
      {openFilter === "teamMatchAvailable" && (
        <FilterTeamMatchAvailable
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}
      {openFilter === "teamLevel" && (
        <FilterTeamLevel
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}
      {openFilter === "hasFormerPro" && (
        <FilterTeamHasFormerPro
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}

      {!isLoading && isLoggedIn && myTeams.length === 0 && (
        <RegisterTeamButton />
      )}

      {isLoading ? (
        <SkeletonContent />
      ) : data ? (
        <div className="mt-3">
          {/* 팀 목록 */}
          {myTeams && myTeams.length > 0 && (
            <>
              <div className="flex items-center gap-2 overflow-hidden px-5 h-8">
                <span className="text-sm sm:text-xs font-medium text-gray-700 shrink-0">
                  소속 팀
                </span>
                <Separator className="min-w-20 grow data-[orientation=horizontal]:w-auto" />
              </div>
              {myTeams.map((team) => (
                <TeamList key={team.id} team={team} />
              ))}
            </>
          )}

          {myTeams && myTeams.length > 0 && (
            <div className="flex items-center gap-2 mt-3 overflow-hidden px-5 h-8">
              <span className="text-sm sm:text-xs font-medium text-gray-700 shrink-0">
                전체 팀
              </span>
              <Separator className="min-w-20 grow data-[orientation=horizontal]:w-auto" />
            </div>
          )}
          {allTeams.map((team) => (
            <TeamList key={team.id} team={team} />
          ))}

          {/* 로딩 인디케이터 */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* 팀이 없는 경우 */}
          {allTeams.length === 0 && !isLoading && (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              {/* <div className="w-16 h-16 mx-auto text-gray-300 mb-4" /> */}
              <SmileyXEyesIcon
                className="size-24 mx-auto text-gray-300 mb-3"
                weight="fill"
              />
              <h3 className="text-lg font-medium text-gray-900">
                팀이 없습니다
              </h3>
              <p className="text-gray-500 mb-6">
                새로운 팀을 만들거나 필터를 변경해보세요
              </p>
            </div>
          )}

          {/* 더 이상 로드할 데이터가 없을 때 */}
          {!hasNextPage && allTeams.length > 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              {/* {isFollowingPage
                ? "모든 팔로잉 팀을 불러왔습니다"
                : "모든 팀을 불러왔습니다"} */}
              모든 팀을 불러왔습니다
            </div>
          )}

          {/* 무한 스크롤 트리거 */}
          <div ref={loadMoreRef} className="h-4" />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-red-500">데이터를 불러오는데 실패했습니다</p>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
