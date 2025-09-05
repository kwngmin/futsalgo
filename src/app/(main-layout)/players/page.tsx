"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, ArrowDownUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { getPlayers, type PlayersResponse } from "./model/actions";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import PlayerList from "./ui/PlayerList";
import { User } from "@prisma/client";
import SkeletonContent from "./ui/SkeletonPlayerContent";
import { FieldModal } from "@/app/(no-layout)/profile/ui/FieldModal";
import FilterModal from "./ui/FilterModal";
import { useRouter } from "next/navigation";

const filterOptions = [
  { id: "all", label: "전체" },
  { id: "MALE", label: "남자" },
  { id: "FEMALE", label: "여자" },
];

type FilterType = "all" | "MALE" | "FEMALE";

type TabType = "players" | "following";

const PlayersPage = () => {
  const router = useRouter();
  // const pathname = usePathname();
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";
  // const isFollowingPage = pathname === "/players/following";

  const [currentTab, setCurrentTab] = useState<TabType>("players");

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    if (tab === "following") {
      router.push("/players/following");
    }
  };

  const [modalStates, setModalStates] = useState({
    sort: false,
  });

  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

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
    queryKey: ["players", "all"],
    queryFn: ({ pageParam }: { pageParam: number }) => getPlayers(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage?.success && lastPage.data?.hasMore) {
        return lastPage.data.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
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
  const currentUser =
    data?.pages?.[0]?.success && data.pages[0].data?.user
      ? data.pages[0].data.user
      : null;

  // 필터에 따라 회원 목록 필터링
  const filteredPlayers = allPlayers.filter((player: User) => {
    if (selectedFilter === "all") return true;
    return player.gender === selectedFilter;
  });

  const openModal = (field: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [field]: true }));
  };

  const closeModal = (field: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [field]: false }));
  };

  const renderFieldModal = (field: "sort") => (
    <FieldModal
      title={`정렬`}
      open={modalStates[field]}
      onOpenChange={(open) => {
        if (!open) closeModal(field);
      }}
      trigger={
        <button
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          onClick={() => openModal(field)}
        >
          <ArrowDownUp className="size-5" />
        </button>
      }
    >
      <FilterModal
        filter={selectedFilter}
        setFilter={setSelectedFilter}
        onSuccess={() => closeModal(field)}
      />
    </FieldModal>
  );

  // 팔로잉 페이지로 이동
  // const handleFollowingClick = () => {
  //   if (isLoggedIn) {
  //     router.push("/players/following");
  //   }
  // };

  // 전체 회원 페이지로 이동
  // const handleAllPlayersClick = () => {
  //   router.push("/players");
  // };

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1
            className={`text-2xl font-bold cursor-pointer transition-opacity ${
              currentTab === "players" ? "" : "opacity-30 hover:opacity-50"
            }`}
            onClick={() => handleTabChange("players")}
            // onClick={handleAllPlayersClick}
          >
            회원
          </h1>
          {/* 로그인된 사용자에게만 팔로잉 버튼 표시 */}
          {isLoggedIn && (
            <h1
              className={`text-2xl font-bold cursor-pointer transition-opacity ${
                currentTab === "following" ? "" : "opacity-30 hover:opacity-50"
              }`}
              onClick={() => handleTabChange("following")}
              // onClick={handleFollowingClick}
            >
              팔로잉
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Search className="size-5" />
          </button>
          {renderFieldModal("sort")}
        </div>
      </div>

      {isLoading ? (
        <SkeletonContent />
      ) : data ? (
        <div className="space-y-3">
          {/* 회원 목록 */}
          <div className="bg-white rounded-2xl">
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

            {/* 필터된 회원 목록 */}
            {filteredPlayers?.map((player) => (
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
          {filteredPlayers?.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {/* {isFollowingPage
                  ? "팔로잉한 회원이 없습니다"
                  : selectedFilter === "all"
                  ? "회원이 없습니다"
                  : `${
                      filterOptions.find((f) => f.id === selectedFilter)?.label
                    } 회원이 없습니다`} */}
                {selectedFilter === "all"
                  ? "회원이 없습니다"
                  : `${
                      filterOptions.find((f) => f.id === selectedFilter)?.label
                    } 회원이 없습니다`}
              </h3>
              <p className="text-gray-500 mb-6">
                {/* {isFollowingPage
                  ? "다른 회원을 팔로우해보세요"
                  : "다른 필터를 선택해보세요"} */}
                다른 필터를 선택해보세요
              </p>
            </div>
          )}

          {/* 더 이상 로드할 데이터가 없을 때 */}
          {!hasNextPage && filteredPlayers?.length > 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              모든 회원을 불러왔습니다
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

export default PlayersPage;
