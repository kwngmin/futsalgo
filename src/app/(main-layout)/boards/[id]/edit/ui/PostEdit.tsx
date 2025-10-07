"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    nickname: string;
  };
}

interface PostEditProps {
  postId: string;
}

/**
 * 게시글 수정 컴포넌트
 * @param postId - 게시글 ID
 * @returns 게시글 수정 폼
 */
const PostEdit = ({ postId }: PostEditProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /**
   * 게시글 조회
   */
  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}`);
      const data = await response.json();

      if (response.ok) {
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
      } else {
        console.error("Failed to fetch post:", data.error);
        alert("게시글을 불러올 수 없습니다.");
        router.push("/boards");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      alert("게시글을 불러올 수 없습니다.");
      router.push("/boards");
    } finally {
      setLoading(false);
    }
  };

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
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (response.ok) {
        router.push(`/boards/${postId}`);
      } else {
        const data = await response.json();
        alert(data.error || "게시글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("게시글 수정에 실패했습니다.");
    } finally {
      setSaving(false);
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
