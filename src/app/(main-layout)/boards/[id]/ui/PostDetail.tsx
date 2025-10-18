"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, MessageCircle, Heart, Trash2, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPost, type PostDetail } from "../../actions/get-post";
import { deletePost } from "../../actions/delete-post";
import { useRouter } from "next/navigation";
import { createEntityQueryKey } from "@/shared/lib/query-key-utils";
import PostComments from "./PostComments";

interface PostDetailProps {
  postId: string;
  initialData?: PostDetail;
}

/**
 * 게시글 상세보기 컴포넌트
 * @param postId - 게시글 ID
 * @param initialData - 초기 데이터
 * @returns 게시글 상세보기
 */
const PostDetail = ({ postId, initialData }: PostDetailProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // TanStack Query를 사용한 데이터 페칭
  const { data, isLoading, error } = useQuery({
    queryKey: createEntityQueryKey("post", "detail", { postId }),
    queryFn: () => getPost(postId),
    initialData: initialData ? { success: true, data: initialData } : undefined,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });

  /**
   * 게시글 삭제
   */
  const handleDelete = async () => {
    try {
      const result = await deletePost(postId);

      if (result.success) {
        // 삭제 성공 시 목록으로 이동
        router.push("/boards");
      } else {
        alert(result.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  // 초기 데이터가 있는 경우 로딩 상태를 보여주지 않음
  if (isLoading && !initialData) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.success || !data.data) {
    return (
      <div className="p-4 text-center text-gray-500">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  const post = data.data;
  const isAuthor = session?.user?.id === post.author.id;

  return (
    <div className="flex-1">
      {/* 게시글 내용 */}
      <div className="bg-white sm:px-4 mb-6">
        {/* 게시글 작성자 및 작성 일시 */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500 py-2 bg-gray-50 px-4 sm:rounded-sm">
          <div className="flex items-center space-x-1">
            <span className="font-medium text-gray-800">
              {post.author.nickname}
            </span>
            <span className="text-gray-500">•</span>
            <span>
              {formatDistanceToNow(post.createdAt, {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="size-4" />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle
                className="size-4 opacity-50"
                fill="gray"
                strokeWidth={0}
              />
              <span>{post._count.comments}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart
                className="size-4.5 opacity-50"
                fill="gray"
                strokeWidth={0}
              />
              <span>{post._count.likes}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between mb-4 px-4">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">
            {post.title}
          </h1>
        </div>

        <div className="prose max-w-none px-4">
          <div className="whitespace-pre-wrap text-gray-900">
            {post.content}
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <PostComments postId={postId} initialComments={post.comments} />

      {/* 게시글 수정 및 삭제 버튼 */}
      {isAuthor && (
        // <div className="flex items-center space-x-2 ml-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 mt-4">
          <button
            onClick={() => (window.location.href = `/boards/${postId}/edit`)}
            // className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            className="rounded-md px-3 flex items-center justify-center h-12 sm:h-11 gap-3 cursor-pointer active:bg-gray-100 w-full transition-colors text-gray-700 font-medium border hover:border-gray-500"
          >
            <Edit className="size-4" />
            수정
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            // className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            className="rounded-md px-3 flex items-center justify-center h-12 sm:h-11 gap-3 cursor-pointer active:bg-destructive/5 w-full transition-colors text-destructive font-medium disabled:opacity-30 disabled:cursor-default border hover:border-destructive/80"
          >
            <Trash2 className="size-4" />
            삭제
          </button>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">게시글 삭제</h3>
            <p className="text-gray-600 mb-6">
              이 게시글을 정말 삭제하시겠습니까?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
