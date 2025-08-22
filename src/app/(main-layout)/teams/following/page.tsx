"use client";

import { useCallback, useEffect } from "react";
import { Search, ArrowDownUp } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  getFollowingTeams,
  type GetFollowingTeamsResponse,
} from "../model/actions";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import TeamCard from "../ui/TeamCard";
import SkeletonContent from "../ui/SkeletonTeamContent";
import { useRouter } from "next/navigation";

const FollowingTeamsPage = () => {
  const router = useRouter();
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";

  // 로그인되지 않은 사용자는 전체 팀 페이지로 리다이렉트
  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/teams");
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
    GetFollowingTeamsResponse,
    Error,
    InfiniteData<GetFollowingTeamsResponse>,
    string[],
    number
  >({
    queryKey: ["teams", "following"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getFollowingTeams(pageParam),
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
  const allTeams =
    data?.pages.flatMap((page) =>
      page?.success && page.data?.teams ? page.data.teams : []
    ) || [];

  // 전체 팀 페이지로 이동
  const handleAllTeamsClick = () => {
    router.push("/teams");
  };

  // 로그인되지 않은 사용자 처리
  if (!isLoggedIn) {
    return null; // useEffect에서 리다이렉트 처리
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1
            className="text-2xl font-bold opacity-30 cursor-pointer"
            onClick={handleAllTeamsClick}
          >
            팀
          </h1>
          <h1 className="text-2xl font-bold">팔로잉</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Search className="size-5" />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <ArrowDownUp className="size-5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonContent />
      ) : data ? (
        <div className="space-y-3">
          {/* 팀 목록 */}
          <div className="bg-white rounded-2xl">
            {/* 팔로잉한 팀 목록 */}
            {allTeams?.map((team) => (
              <TeamCard key={team.id} team={team} />
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
                팔로잉한 팀이 없습니다
              </h3>
              <p className="text-gray-500 mb-6">다른 팀을 팔로우해보세요</p>
              <button
                onClick={handleAllTeamsClick}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                전체 팀 보기
              </button>
            </div>
          )}

          {/* 더 이상 로드할 데이터가 없을 때 */}
          {!hasNextPage && allTeams.length > 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              모든 팔로잉 팀을 불러왔습니다
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

export default FollowingTeamsPage;
