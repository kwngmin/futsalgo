"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, MessageCircle, Heart, Edit, Trash2 } from "lucide-react";
import PostComments from "./PostComments";

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

interface PostDetailProps {
  postId: string;
}

/**
 * 게시글 상세보기 컴포넌트
 * @param postId - 게시글 ID
 * @returns 게시글 상세보기
 */
const PostDetail = ({ postId }: PostDetailProps) => {
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * 게시글 조회
   */
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}`);
      const data = await response.json();

      if (response.ok) {
        setPost(data);
      } else {
        console.error("Failed to fetch post:", data.error);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  /**
   * 게시글 삭제
   */
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 삭제 성공 시 목록으로 이동
        window.location.href = "/boards";
      } else {
        const data = await response.json();
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  if (loading) {
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

  if (!post) {
    return (
      <div className="p-4 text-center text-gray-500">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  const isAuthor = session?.user?.id === post.author.id;

  return (
    <div className="flex-1">
      {/* 게시글 내용 */}
      <div className="bg-white sm:px-4 mb-6">
        {/* 게시글 작성자 및 작성 일시 */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500 py-2 bg-gray-50 px-4 sm:rounded-sm">
          <div className="flex items-center space-x-4">
            <span>{post.author.nickname}</span>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
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
              <MessageCircle className="size-4" />
              <span>{post._count.comments}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="size-4" />
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
      <PostComments postId={postId} />

      {/* 게시글 수정 및 삭제 버튼 */}
      {isAuthor && (
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => (window.location.href = `/boards/${postId}/edit`)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit className="size-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">게시글 삭제</h3>
            <p className="text-gray-600 mb-6">
              정말로 이 게시글을 삭제하시겠습니까?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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
