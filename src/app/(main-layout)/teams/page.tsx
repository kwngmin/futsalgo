"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, ArrowDownUp, Plus, ChevronRight } from "lucide-react";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getTeams, type GetTeamsResponse } from "./model/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SkeletonContent from "./ui/SkeletonTeamContent";
import TeamList from "./ui/TeamList";

type TabType = "teams" | "following";

const TeamsPage = () => {
  const router = useRouter();
  // const pathname = usePathname();
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";
  // const isFollowingPage = pathname === "/teams/following";

  const [currentTab, setCurrentTab] = useState<TabType>("teams");

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    if (tab === "following") {
      router.push("/teams/following");
    }
  };

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
    queryKey: ["teams", "all"],
    queryFn: ({ pageParam }: { pageParam: number }) => getTeams(pageParam),
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
  const allTeams =
    data?.pages.flatMap((page) =>
      page?.success && page.data?.teams ? page.data.teams : []
    ) || [];

  // 내 팀들은 첫 번째 페이지에서만 가져옴
  const myTeams =
    data?.pages?.[0]?.success && data.pages[0].data?.myTeams
      ? data.pages[0].data.myTeams
      : [];

  console.log(data, "data");
  console.log(isLoading, "isLoading");
  console.log(error, "error");
  console.log(myTeams, "myTeams");

  // 팔로잉 페이지로 이동
  // const handleFollowingClick = () => {
  //   if (isLoggedIn) {
  //     router.push("/teams/following");
  //   }
  // };

  // 전체 팀 페이지로 이동
  // const handleAllTeamsClick = () => {
  //   router.push("/teams");
  // };

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1
            className={`text-2xl font-bold cursor-pointer transition-opacity ${
              currentTab === "teams" ? "" : "opacity-30 hover:opacity-50"
            }`}
            // onClick={handleAllTeamsClick}
            onClick={() => handleTabChange("teams")}
          >
            팀
          </h1>
          {/* 로그인된 사용자에게만 팔로잉 버튼 표시 */}
          {isLoggedIn && (
            <h1
              className={`text-2xl font-bold cursor-pointer transition-opacity ${
                currentTab === "following" ? "" : "opacity-30 hover:opacity-50"
              }`}
              // onClick={handleFollowingClick}
              onClick={() => handleTabChange("following")}
            >
              팔로잉
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Search className="size-5" />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <ArrowDownUp className="size-5" />
          </button>
          {/* 팀 생성 버튼 (전체 팀 페이지에서만 표시) */}
          {/* {Array.isArray(myTeams) && myTeams.length < 6 && (
            <button
              type="button"
              onClick={() => router.push(isLoggedIn ? "/teams/create" : "/")}
              className="shrink-0 size-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer font-semibold"
            >
              <Plus className="size-5" strokeWidth={2} />
            </button>
          )} */}
        </div>
      </div>

      {isLoggedIn && Array.isArray(myTeams) && myTeams.length < 6 && (
        <button
          type="button"
          onClick={() => router.push(isLoggedIn ? "/teams/create" : "/")}
          className="fixed bottom-[58px] sm:bottom-16 md:left-20 lg:left-72 md:bottom-0 left-0 right-0 sm:max-w-2xs md:max-w-2xl mx-auto shrink-0 h-14 sm:h-10 md:h-11 flex items-center justify-between bg-emerald-600 text-white hover:bg-emerald-800 rounded-t-3xl sm:rounded-full md:rounded-b-none md:rounded-t-2xl transition-colors cursor-pointer font-semibold z-20 px-5 sm:px-2 md:px-3 active:bg-black"
        >
          <div className="flex items-center justify-center gap-3 sm:gap-2">
            <div className="shrink-0 size-7 sm:size-6 flex items-center justify-center bg-white text-emerald-700 rounded-full">
              <Plus className="size-5" strokeWidth={2.5} />
            </div>
            <span className="sm:text-sm font-semibold">새로운 팀 등록</span>
          </div>
          <ChevronRight className="size-6 opacity-80" strokeWidth={1.5} />
        </button>
      )}

      {isLoading ? (
        <SkeletonContent />
      ) : data ? (
        <div className="space-y-3">
          {/* 팀 목록 */}
          <div className="bg-white rounded-2xl">
            {allTeams.map((team) => (
              <TeamList key={team.id} team={team} />
            ))}

            {/* 로딩 인디케이터 */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>

          {/* 팀이 없는 경우 */}
          {allTeams.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {/* {isFollowingPage ? "팔로잉한 팀이 없습니다" : "팀이 없습니다"} */}
                팀이 없습니다
              </h3>
              <p className="text-gray-500 mb-6">
                {/* {isFollowingPage
                  ? "다른 팀을 팔로우해보세요"
                  : "새로운 팀을 만들어보세요"} */}
                새로운 팀을 만들어보세요
              </p>
              {/* {isFollowingPage && (
                <button
                  onClick={handleAllTeamsClick}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  전체 팀 보기
                </button>
              )} */}
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
