"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { getPlayers, type PlayersResponse } from "./model/actions";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import PlayerList from "./ui/PlayerList";
import { PlayerSkillLevel } from "@prisma/client";
import SkeletonContent from "./ui/SkeletonPlayerContent";
import { useRouter } from "next/navigation";
import ListHeader, { TabType } from "@/features/tab-and-search/ui/ListHeader";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useInView } from "react-intersection-observer";
import PlayerFilterBar, {
  PlayerFilterType,
  PlayerFilterValues,
} from "@/features/filter-list/ui/PlayerFilterBar";
import { PLAYER_FILTER_OPTIONS } from "@/entities/user/model/constants";
import FilterPlayerLevel, {
  PlayerSkillLevelFilter,
} from "@/features/filter-list/ui/FilterPlayerLevel";
import { PlayerFilters } from "@/features/filter-list/model/types";
import FilterPlayerGender from "@/features/filter-list/ui/FilterPlayerGender";
import FilterPlayerBackground from "@/features/filter-list/ui/FilterPlayerBackground";
import FilterPlayerAge from "@/features/filter-list/ui/FilterPlayerAge";
import { Separator } from "@/shared/components/ui/separator";
import { SmileyXEyesIcon } from "@phosphor-icons/react";

const PlayersPage = () => {
  const router = useRouter();
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";

  const [currentTab, setCurrentTab] = useState<TabType>("players");
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

    // age 필터
    if (filterValues.age) {
      filterObj.minAge = Number(filterValues.age.minAge) || undefined;
      filterObj.maxAge = Number(filterValues.age.maxAge) || undefined;
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

  // 인피니티 쿼리 사용
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    // error,
  } = useInfiniteQuery<
    PlayersResponse,
    Error,
    InfiniteData<PlayersResponse>,
    string[],
    number
  >({
    queryKey: ["players", "all", JSON.stringify(filters)],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getPlayers(pageParam, filters),
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
  const players = useMemo(
    () =>
      data?.pages.flatMap((page) =>
        page?.success && page.data?.players ? page.data.players : []
      ) || [],
    [data?.pages]
  );

  const currentUser =
    data?.pages?.[0]?.success && data.pages[0].data?.user
      ? data.pages[0].data.user
      : null;

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
        <div className="mt-3">
          {/* 내 프로필 섹션 (전체 회원 페이지에서만 표시) */}
          {isLoggedIn && currentUser ? (
            <PlayerList
              player={currentUser}
              isCurrentUser={true}
              teamName={
                currentUser.teams.length > 1
                  ? `${currentUser.teams[0]?.team?.name} 외 ${
                      currentUser.teams.length - 1
                    }개 팀`
                  : currentUser.teams[0]?.team?.name
              }
              teamLogoUrl={currentUser.teams[0]?.team?.logoUrl || undefined}
            />
          ) : null}

          {/* {isLoggedIn && currentUser  */}

          {isLoggedIn && currentUser && (
            <div className="flex items-center gap-2 mt-3 overflow-hidden px-5 h-8">
              <span className="text-sm sm:text-xs font-medium text-gray-700 shrink-0">
                전체 회원
              </span>
              <Separator className="min-w-20 grow data-[orientation=horizontal]:w-auto" />
            </div>
          )}
          {!currentUser && players.length > 0 && (
            <div className="flex items-center gap-2 overflow-hidden px-5 h-8">
              <span className="text-sm sm:text-xs font-medium text-gray-700 shrink-0">
                전체 회원
              </span>
              <Separator className="min-w-20 grow data-[orientation=horizontal]:w-auto" />
            </div>
          )}
          {/* 필터된 회원 목록 */}
          {players?.map((player) => (
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

          {/* 회원이 없는 경우 */}
          {players?.length === 0 && !isLoading && (
            <div className="text-center py-12 flex flex-col items-center justify-center h-[65vh]">
              {/* <div className="w-16 h-16 mx-auto text-gray-300 mb-4" /> */}
              <SmileyXEyesIcon
                className="size-28 mx-auto text-gray-200 mb-4"
                weight="fill"
              />
              <h3 className="text-lg font-medium text-gray-900">
                회원이 없습니다
              </h3>
              <p className="text-gray-500 mb-6">다른 필터를 선택해보세요</p>
            </div>
          )}

          {/* 더 이상 로드할 데이터가 없을 때 */}
          {!hasNextPage && players?.length > 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              모든 회원을 불러왔습니다
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

export default PlayersPage;
