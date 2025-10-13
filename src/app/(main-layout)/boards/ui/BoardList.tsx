"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { SmileyXEyesIcon } from "@phosphor-icons/react";
// import { Eye, MessageCircle, Heart } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  views: number;
  createdAt: string;
  author: {
    id: string;
    nickname: string;
    image?: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 게시판 목록 컴포넌트
 * @returns 게시판 목록
 */
const BoardList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  /**
   * 게시글 목록 조회
   * @param page - 페이지 번호
   */
  const fetchPosts = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/posts?boardId=free&page=${page}&limit=20`
      );
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts);
        setPagination(data.pagination);
      } else {
        console.error("Failed to fetch posts:", data.error);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  /**
   * 페이지 변경 핸들러
   * @param page - 페이지 번호
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
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

  return (
    <div className="flex-1">
      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center justify-center mt-3">
          {/* <div className="w-16 h-16 mx-auto text-gray-300 mb-4" /> */}
          <SmileyXEyesIcon
            className="size-28 mx-auto text-gray-200 mb-4"
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
                {formatDistanceToNow(new Date(post.createdAt), {
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
