"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { SmileyXEyesIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { getPosts, type GetPostsResponse } from "../actions/get-posts";
import { createEntityQueryKey } from "@/shared/lib/query-key-utils";

interface BoardListProps {
  initialData: GetPostsResponse;
}

/**
 * 게시판 목록 컴포넌트
 * @param initialData - 초기 데이터
 * @returns 게시판 목록
 */
const BoardList = ({ initialData }: BoardListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // TanStack Query를 사용한 데이터 페칭
  const { data, isLoading, error } = useQuery({
    queryKey: createEntityQueryKey("posts", "list", {
      boardId: "free",
      page: currentPage,
    }),
    queryFn: () => getPosts(currentPage, 20, "free"),
    initialData: currentPage === 1 ? initialData : undefined,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });

  /**
   * 페이지 변경 핸들러
   * @param page - 페이지 번호
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 초기 데이터가 있고 첫 페이지인 경우 로딩 상태를 보여주지 않음
  if (isLoading && currentPage !== 1) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다</p>
      </div>
    );
  }

  const posts = data.data?.posts || [];
  const pagination = data.data?.pagination;

  return (
    <div className="flex-1">
      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center justify-center mt-3">
          {/* <div className="w-16 h-16 mx-auto text-gray-300 mb-4" /> */}
          <SmileyXEyesIcon
            className="size-24 mx-auto text-gray-300 mb-3"
            weight="fill"
          />
          <h3 className="text-lg font-medium text-gray-900">
            게시글이 없습니다
          </h3>
          <p className="text-gray-500 mb-6">새로운 게시글을 작성해보세요</p>
        </div>
      ) : (
        posts.map((post) => (
          <Link
            key={post.id}
            href={`/boards/${post.id}`}
            className="flex flex-col justify-center px-4 py-2 bg-white transition-colors hover:bg-gray-50"
          >
            <h3 className="font-semibold text-gray-900 truncate">
              {post.title}
              {post._count &&
                post._count.comments > 0 &&
                post._count.comments !== 0 && (
                  <span className="text-sm font-medium text-amber-600 px-2">
                    {post._count.comments}
                  </span>
                )}
            </h3>
            {/* <p className="text-gray-600 mt-1 line-clamp-2">{post.content}</p> */}
            <div className="flex items-center my-1 space-x-1 text-sm">
              <span className="font-medium text-gray-700">
                {post.author.nickname}
              </span>
              <span className="text-gray-400"> • </span>
              <span className="text-gray-500">
                {formatDistanceToNow(post.createdAt, {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
              {/* <div className="flex items-center space-x-3 ml-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Eye className="size-3.5" />
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="size-3.5" />
                    <span>{post._count.comments}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="size-3.5" />
                    <span>{post._count.likes}</span>
                  </div>
                </div> */}
            </div>
          </Link>
        ))
      )}

      {/* 페이지네이션 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8 px-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>

          <div className="flex space-x-1">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const pageNum =
                  Math.max(
                    1,
                    Math.min(pagination.totalPages - 4, currentPage - 2)
                  ) + i;
                if (pageNum > pagination.totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      pageNum === currentPage
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardList;
