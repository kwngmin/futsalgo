"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useEffect } from "react";
import { useInView } from "react-intersection-observer";

import {
  getTournamentNews,
  GetTournamentNewsResponse,
} from "../actions/get-tournament-news";
import { useNewsFilters } from "../lib/use-news-filters";
import NewsHeader from "./NewsHeader";
import NewsList from "./NewsList";

interface Props {
  initialData: GetTournamentNewsResponse;
  searchQuery?: string;
}

/**
 * Client Component - 인피니티 스크롤 처리
 */
const NewsInfiniteClient = ({ initialData, searchQuery }: Props) => {
  const router = useRouter();
  const session = useSession();
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px", // 뷰포트보다 100px 전에 로딩 시작
  });

  const {
    currentTab,
    searchFocused,
    searchValue,
    filters,
    handleTabChange,
    handleSearchChange,
    handleSearchClear,
    handleSearchFocus,
    handleSearchClose,
  } = useNewsFilters({
    initialSearch: searchQuery ?? "",
    router,
  });

  // 필터가 적용되었는지 확인
  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.searchQuery);
  }, [filters]);

  // useInfiniteQuery로 페이지네이션 처리
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ["tournament-news", session.data?.user?.id, filters],
      queryFn: ({ pageParam = 1 }) =>
        getTournamentNews({
          ...filters,
          page: pageParam,
          pageSize: 20,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        // 더 가져올 데이터가 있는지 확인
        if (
          !lastPage.data?.news ||
          lastPage.data.news.length < 20 ||
          !lastPage.data.hasMore
        ) {
          return undefined; // 더 이상 페이지 없음
        }
        return allPages.length + 1; // 다음 페이지 번호
      },
      // 필터가 없을 때만 초기 데이터 사용
      initialData: !hasActiveFilters
        ? {
            pages: [initialData],
            pageParams: [1],
          }
        : undefined,
      staleTime: 1000 * 60 * 30, // 30분
      gcTime: 1000 * 60 * 60, // 1시간
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    });

  // 스크롤이 하단에 도달하면 자동으로 다음 페이지 로드
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleNewsCreate = useCallback(() => {
    router.push("/news/new");
  }, [router]);

  // 모든 페이지의 데이터를 병합
  const allNews = useMemo(() => {
    if (!data) return [];

    return data.pages.flatMap((page) => page.data?.news || []);
  }, [data]);

  const tabOptions = useMemo(
    () => [
      { tab: "all" as const, label: "대회 소식" },
      { tab: "saved" as const, label: "보관함" },
    ],
    []
  );

  return (
    <>
      <NewsHeader
        tabOptions={tabOptions}
        placeholder="제목 또는 내용 검색"
        currentTab={currentTab}
        searchFocused={searchFocused}
        searchValue={searchValue}
        onTabChange={handleTabChange}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        onSearchFocus={handleSearchFocus}
        onSearchClose={handleSearchClose}
        onPlusAction={handleNewsCreate}
      />

      {/* 뉴스 목록 */}
      <NewsList news={allNews} isLoading={isFetching} />

      {/* 인피니티 스크롤 트리거 */}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          ) : (
            <div className="text-sm text-muted-foreground">
              스크롤하여 더 보기
            </div>
          )}
        </div>
      )}

      {/* 모든 데이터 로드 완료 */}
      {!hasNextPage && allNews.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="text-sm text-muted-foreground">
            모든 소식을 불러왔습니다
          </div>
        </div>
      )}
    </>
  );
};

export default NewsInfiniteClient;
