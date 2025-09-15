"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  getFollowingPlayers,
  type FollowingPlayersResponse,
} from "../model/actions";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import PlayerList from "../ui/PlayerList";
import { PlayerSkillLevel } from "@prisma/client";
import SkeletonContent from "../ui/SkeletonPlayerContent";
import { useRouter } from "next/navigation";
import ListHeader, { TabType } from "@/features/tab-and-search/ui/ListHeader";
import { useDebounce } from "@/shared/hooks/use-debounce";
import PlayerFilterBar, {
  PlayerFilterType,
  PlayerFilterValues,
} from "@/features/filter-list/ui/PlayerFilterBar";
import FilterPlayerLevel, {
  PlayerSkillLevelFilter,
} from "@/features/filter-list/ui/FilterPlayerLevel";
import { PlayerFilters } from "@/features/filter-list/model/types";
import { PLAYER_FILTER_OPTIONS } from "@/entities/user/model/constants";
import FilterPlayerGender from "@/features/filter-list/ui/FilterPlayerGender";
import FilterPlayerBackground from "@/features/filter-list/ui/FilterPlayerBackground";
import FilterPlayerAge from "@/features/filter-list/ui/FilterPlayerAge";

const FollowingPlayersPage = () => {
  const router = useRouter();
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";

  const [currentTab, setCurrentTab] = useState<TabType>("following");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  // 디바운스된 검색어
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const [openFilter, setOpenFilter] = useState<PlayerFilterType>(null);
  const [filterValues, setFilterValues] = useState<PlayerFilterValues>({
    gender: undefined,
    background: undefined,
    age: undefined,
    skillLevel: undefined,
  });

  // PlayerSkillLevelFilter를 PlayerSkillLevel 배열로 변환하는 헬퍼 함수
  const convertTeamLevelFilterToArray = useCallback(
    (teamLevelFilter: PlayerSkillLevelFilter): PlayerSkillLevel[] => {
      return Object.entries(teamLevelFilter)
        .filter(([key, value]) => key !== "label" && value === true)
        .map(([key]) => key as PlayerSkillLevel);
    },
    []
  );

  // 필터 객체 생성 - 메모이제이션
  const filters = useMemo<PlayerFilters>(() => {
    const filterObj: PlayerFilters = {
      searchQuery: debouncedSearchValue,
    };

    // gender 필터
    if (filterValues.gender) {
      filterObj.gender = filterValues.gender.value;
    }

    // teamLevel 필터 - 배열 방식으로 변경
    if (filterValues.skillLevel) {
      const selectedTeamLevels = convertTeamLevelFilterToArray(
        filterValues.skillLevel
      );

      // 선택된 팀 레벨이 있을 때만 필터 추가
      if (selectedTeamLevels.length > 0 && selectedTeamLevels.length < 5) {
        filterObj.skillLevel = selectedTeamLevels;
      }
      // 모든 팀 레벨이 선택되었거나 아무것도 선택되지 않았으면 필터를 추가하지 않음
    }

    // background 필터
    if (filterValues.background) {
      filterObj.background = filterValues.background.value;
    }

    return filterObj;
  }, [debouncedSearchValue, filterValues, convertTeamLevelFilterToArray]);

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    if (tab === "following") {
      router.push("/players/following");
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

  // 로그인되지 않은 사용자는 전체 회원 페이지로 리다이렉트
  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/players");
    }
  }, [session.status, router]);

  // 인피니티 쿼리 사용
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    // error,
  } = useInfiniteQuery<
    FollowingPlayersResponse,
    Error,
    InfiniteData<FollowingPlayersResponse>,
    string[],
    number
  >({
    queryKey: ["players", "all", JSON.stringify(filters)],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getFollowingPlayers(pageParam, filters),
    getNextPageParam: (lastPage) => {
      if (lastPage?.success && lastPage.data?.hasMore) {
        return lastPage.data.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: isLoggedIn, // 로그인된 사용자만 쿼리 실행
  });

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000
    ) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 스크롤 이벤트 등록
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 모든 페이지의 데이터를 합치기
  const allPlayers =
    data?.pages.flatMap((page) =>
      page?.success && page.data?.players ? page.data.players : []
    ) || [];

  // 로그인되지 않은 사용자 처리
  if (!isLoggedIn) {
    return null; // useEffect에서 리다이렉트 처리
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 헤더 - 메모이제이션되어 data 변경 시 리렌더링 안 됨 */}
      <ListHeader
        tabOptions={[
          { tab: "players", label: "회원" },
          { tab: "following", label: "팔로잉" },
        ]}
        placeholder="회원 닉네임 검색"
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
      <PlayerFilterBar
        filterOptions={PLAYER_FILTER_OPTIONS}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        filterValues={filterValues}
        setFilterValues={setFilterValues}
      />

      {/* 필터 내용 */}
      {openFilter === "gender" && (
        <FilterPlayerGender
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}
      {openFilter === "background" && (
        <FilterPlayerBackground
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}
      {openFilter === "age" && (
        <FilterPlayerAge
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}
      {openFilter === "skillLevel" && (
        <FilterPlayerLevel
          onClose={() => setOpenFilter(null)}
          setFilterValues={(values) =>
            setFilterValues({ ...filterValues, ...values })
          }
        />
      )}

      {isLoading ? (
        <SkeletonContent />
      ) : data ? (
        <div className="space-y-3 mt-3">
          {/* 회원 목록 */}
          <div className="bg-white rounded-2xl">
            {/* 필터된 회원 목록 */}
            {allPlayers?.map((player) => (
              <PlayerList
                key={player.id}
                player={player}
                teamName={
                  player.teams.length > 1
                    ? `${player.teams[0]?.team?.name} 외 ${
                        player.teams.length - 1
                      }개 팀`
                    : player.teams[0]?.team?.name
                }
                teamLogoUrl={player.teams[0]?.team?.logoUrl || undefined}
              />
            ))}

            {/* 로딩 인디케이터 */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>

          {/* 회원이 없는 경우 */}
          {allPlayers?.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                팔로잉한 회원이 없습니다
              </h3>
              <p className="text-gray-500 mb-6">다른 회원을 팔로우해보세요</p>
              <button
                // onClick={handleAllPlayersClick}
                onClick={() => handleTabChange("players")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                전체 회원 보기
              </button>
            </div>
          )}

          {/* 더 이상 로드할 데이터가 없을 때 */}
          {!hasNextPage && allPlayers?.length > 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              모든 팔로잉 회원을 불러왔습니다
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-red-500">데이터를 불러오는데 실패했습니다</p>
        </div>
      )}
    </div>
  );
};

export default FollowingPlayersPage;
