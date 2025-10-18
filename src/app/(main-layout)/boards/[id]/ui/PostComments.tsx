"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { MessageCircle, Reply, Edit, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  type Comment,
} from "../../actions/comment-actions";
import { createEntityQueryKey } from "@/shared/lib/query-key-utils";

interface PostCommentsProps {
  postId: string;
  initialComments?: Comment[];
}

/**
 * 게시글 댓글 컴포넌트
 * @param postId - 게시글 ID
 * @param initialComments - 초기 댓글 데이터
 * @returns 댓글 섹션
 */
const PostComments = ({ postId, initialComments }: PostCommentsProps) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // TanStack Query를 사용한 댓글 데이터 페칭
  const { data, isLoading } = useQuery({
    queryKey: createEntityQueryKey("comments", "list", { postId }),
    queryFn: () => getComments(postId),
    initialData: initialComments
      ? { success: true, data: initialComments }
      : undefined,
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
    gcTime: 5 * 60 * 1000, // 5분간 가비지 컬렉션 방지
  });

  const comments = data?.success ? data.data || [] : [];

  /**
   * 새 댓글 작성
   */
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const result = await createComment(postId, newComment);

      if (result.success) {
        setNewComment("");
        // 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: createEntityQueryKey("comments", "list", { postId }),
        });
      } else {
        alert(result.error || "댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  /**
   * 답글 작성
   */
  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const result = await createComment(postId, replyContent, parentId);

      if (result.success) {
        setReplyContent("");
        setReplyingTo(null);
        // 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: createEntityQueryKey("comments", "list", { postId }),
        });
      } else {
        alert(result.error || "답글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error creating reply:", error);
      alert("답글 작성에 실패했습니다.");
    }
  };

  /**
   * 댓글 수정
   */
  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const result = await updateComment(commentId, editContent);

      if (result.success) {
        setEditContent("");
        setEditingComment(null);
        // 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: createEntityQueryKey("comments", "list", { postId }),
        });
      } else {
        alert(result.error || "댓글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  /**
   * 댓글 삭제
   */
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;

    try {
      const result = await deleteComment(commentId);

      if (result.success) {
        // 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: createEntityQueryKey("comments", "list", { postId }),
        });
      } else {
        alert(result.error || "댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  // 초기 데이터가 있는 경우 로딩 상태를 보여주지 않음
  if (isLoading && !initialComments) {
    return (
      <div className="px-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* 댓글 헤더 */}
      <div className="py-4 border-b border-gray-200 sm:px-4">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageCircle className="size-5 mr-2" />
          댓글 {comments.length}개
        </h3>
      </div>

      {/* 댓글 목록 */}
      <div className="divide-y divide-gray-200">
        {comments.length === 0 ? (
          <div className="sm:px-4 py-8 text-center text-gray-500">
            아직 댓글이 없습니다.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="sm:px-4 py-4">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.author.nickname}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(comment.createdAt, {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </div>

                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => {
                            setEditingComment(null);
                            setEditContent("");
                          }}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  )}

                  {/* 댓글 액션 버튼 */}
                  {session && !editingComment && (
                    <div className="flex items-center space-x-4 mt-2">
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Reply className="size-4" />
                        <span>답글</span>
                      </button>
                      {session.user.id === comment.author.id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditContent(comment.content);
                            }}
                            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="size-4" />
                            <span>수정</span>
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="size-4" />
                            <span>삭제</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* 답글 작성 */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답글을 작성해주세요..."
                        className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleSubmitReply(comment.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          답글 작성
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent("");
                          }}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 답글 목록 */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-6 space-y-3">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="flex items-start space-x-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {reply.author.nickname}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(reply.createdAt, {
                                  addSuffix: true,
                                  locale: ko,
                                })}
                              </span>
                            </div>
                            <div className="text-sm text-gray-900 whitespace-pre-wrap">
                              {reply.content}
                            </div>
                            {session?.user.id === reply.author.id && (
                              <div className="flex items-center space-x-3 mt-1">
                                <button
                                  onClick={() => {
                                    setEditingComment(reply.id);
                                    setEditContent(reply.content);
                                  }}
                                  className="text-xs text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="text-xs text-gray-600 hover:text-red-600 transition-colors"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 댓글 작성 */}
      {session ? (
        <div className="flex flex-col sm:flex-row gap-x-2 py-4 border-b border-gray-200">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 작성해주세요..."
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-end mt-3 sm:mt-0">
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 sm:w-28 cursor-pointer font-medium"
            >
              댓글 작성
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6 py-4 border-b border-gray-200 text-center text-gray-500">
          댓글을 작성하려면 로그인이 필요합니다.
        </div>
      )}
    </div>
  );
};

export default PostComments;
