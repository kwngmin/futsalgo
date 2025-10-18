"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPost,
  type PostDetail,
} from "@/app/(main-layout)/boards/actions/get-post";
import { updatePost } from "@/app/(main-layout)/boards/actions/update-post";
import { createEntityQueryKey } from "@/shared/lib/query-key-utils";

interface PostEditProps {
  postId: string;
  initialData?: PostDetail;
}

/**
 * 게시글 수정 컴포넌트
 * @param postId - 게시글 ID
 * @param initialData - 초기 데이터
 * @returns 게시글 수정 폼
 */
const PostEdit = ({ postId, initialData }: PostEditProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [saving, setSaving] = useState(false);

  // TanStack Query를 사용한 데이터 페칭
  const { data, isLoading, error } = useQuery({
    queryKey: createEntityQueryKey("post", "detail", { postId }),
    queryFn: () => getPost(postId),
    initialData: initialData ? { success: true, data: initialData } : undefined,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });

  /**
   * 게시글 수정
   */
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      const result = await updatePost(postId, title.trim(), content.trim());

      if (result.success) {
        // 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: createEntityQueryKey("post", "detail", { postId }),
        });
        queryClient.invalidateQueries({
          queryKey: createEntityQueryKey("posts", "list", { boardId: "free" }),
        });
        router.push(`/boards/${postId}`);
      } else {
        alert(result.error || "게시글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("게시글 수정에 실패했습니다.");
    } finally {
      setSaving(false);
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

  if (!session || session.user.id !== post.author.id) {
    return (
      <div className="p-4 text-center text-gray-500">
        게시글을 수정할 권한이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex-1 px-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {/* 제목 입력 */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {title.length}/100
            </div>
          </div>

          {/* 내용 입력 */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={15}
              maxLength={5000}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {content.length}/5000
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !title.trim() || !content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "수정 중..." : "수정하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEdit;
