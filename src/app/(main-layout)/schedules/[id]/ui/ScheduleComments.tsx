"use client";

import React, {
  useState,
  useOptimistic,
  useTransition,
  useRef,
  useEffect,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Loader2,
  AlertCircle,
  PencilLine,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
} from "lucide-react";
import {
  addComment,
  getScheduleComments,
  deleteComment,
} from "../actions/get-schedule-comments";
import Image from "next/image";
import { ChatCircleDotsIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

// 타입 정의
interface User {
  id: string;
  name: string;
  nickname?: string;
  image?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  replies: Comment[];
  parentId?: string;
  isDeleted?: boolean; // 삭제 여부 추가
}

interface TeamMember {
  userId: string;
  teamId: string;
  role: "OWNER" | "MANAGER" | "MEMBER";
  user: User;
}

interface Schedule {
  id: string;
  hostTeamId: string;
  invitedTeamId?: string;
  hostTeam: {
    id: string;
    name: string;
    members: TeamMember[];
  };
  invitedTeam?: {
    id: string;
    name: string;
    members: TeamMember[];
  };
}

interface ScheduleCommentsData {
  schedule: Schedule;
  comments: Comment[];
  currentUser?: User;
}

interface ScheduleCommentsProps {
  scheduleId: string;
}

const ScheduleComments: React.FC<ScheduleCommentsProps> = ({ scheduleId }) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [focusNewComment, setFocusNewComment] = useState(false);
  const [focusReply, setFocusReply] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );
  const router = useRouter();

  // useRef로 textarea 참조
  const newCommentRef = useRef<HTMLTextAreaElement>(null);
  const replyRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  const queryClient = useQueryClient();

  // 댓글 쓰기 시 textarea 포커스
  useEffect(() => {
    if (focusNewComment && newCommentRef.current) {
      newCommentRef.current.focus();
    }
  }, [focusNewComment]);

  // 답글 쓰기 시 textarea 포커스
  useEffect(() => {
    if (focusReply && replyRefs.current[focusReply]) {
      setTimeout(() => {
        replyRefs.current[focusReply]?.focus();
      }, 0);
    }
  }, [focusReply]);

  // 답글 펼치기/접기 토글 함수
  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // 댓글 데이터 조회
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["schedule-comments", scheduleId],
    queryFn: () => getScheduleComments(scheduleId),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });

  // 댓글 추가 mutation
  const addCommentMutation = useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: string;
    }) => addComment(scheduleId, content, parentId),
    onSuccess: (newComment) => {
      if (newComment.parentId) {
        setExpandedReplies((prev) => new Set(prev).add(newComment.parentId!));
      }

      queryClient.setQueryData(
        ["schedule-comments", scheduleId],
        (oldData: ScheduleCommentsData | undefined) => {
          if (!oldData) return oldData;

          if (newComment.parentId) {
            const updateComments = (comments: Comment[]): Comment[] => {
              return comments.map((comment) => {
                if (comment.id === newComment.parentId) {
                  return {
                    ...comment,
                    replies: [...comment.replies, newComment],
                  };
                }
                if (comment.replies.length > 0) {
                  return {
                    ...comment,
                    replies: updateComments(comment.replies),
                  };
                }
                return comment;
              });
            };

            return {
              ...oldData,
              comments: updateComments(oldData.comments),
            };
          } else {
            return {
              ...oldData,
              comments: [...oldData.comments, newComment],
            };
          }
        }
      );
    },
    onError: (error) => {
      console.error("댓글 작성 실패:", error);
      refetch();
    },
  });

  // 댓글 삭제 mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onMutate: async (commentId) => {
      setDeletingCommentId(commentId);
    },
    onSuccess: (result, commentId) => {
      // 캐시 업데이트
      queryClient.setQueryData(
        ["schedule-comments", scheduleId],
        (oldData: ScheduleCommentsData | undefined) => {
          if (!oldData) return oldData;

          const updateComments = (comments: Comment[]): Comment[] => {
            return comments
              .map((comment) => {
                if (comment.id === commentId) {
                  // soft delete인 경우
                  if (result.softDeleted) {
                    return {
                      ...comment,
                      isDeleted: true,
                      content: "댓글이 삭제되었습니다",
                    };
                  }
                  // hard delete인 경우 null 반환 (나중에 필터링)
                  return null;
                }
                // 답글 처리
                if (comment.replies.length > 0) {
                  const filteredReplies = comment.replies.filter(
                    (reply) => reply.id !== commentId || result.softDeleted
                  );
                  const updatedReplies = filteredReplies.map((reply) => {
                    if (reply.id === commentId && result.softDeleted) {
                      return {
                        ...reply,
                        isDeleted: true,
                        content: "댓글이 삭제되었습니다",
                      };
                    }
                    return reply;
                  });
                  return {
                    ...comment,
                    replies: updatedReplies,
                  };
                }
                return comment;
              })
              .filter((comment): comment is Comment => comment !== null);
          };

          return {
            ...oldData,
            comments: updateComments(oldData.comments),
          };
        }
      );
      setDeletingCommentId(null);
    },
    onError: (error) => {
      console.error("댓글 삭제 실패:", error);
      setDeletingCommentId(null);
      refetch();
    },
  });

  // Optimistic updates를 위한 hook
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    data?.comments || [],
    (state: Comment[], newComment: Comment) => {
      if (newComment.parentId) {
        const updateComments = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === newComment.parentId) {
              return { ...comment, replies: [...comment.replies, newComment] };
            }
            if (comment.replies.length > 0) {
              return { ...comment, replies: updateComments(comment.replies) };
            }
            return comment;
          });
        };
        return updateComments(state);
      } else {
        return [...state, newComment];
      }
    }
  );

  // 답글 쓰기 핸들러
  const handleReplyClick = (commentId: string) => {
    setReplyingTo(commentId);
    setFocusReply(commentId);
  };

  // 댓글 삭제 확인
  const handleDeleteComment = async (
    commentId: string,
    hasReplies: boolean
  ) => {
    const message = hasReplies
      ? "답글이 있는 댓글입니다. 댓글 내용만 삭제되고 답글은 유지됩니다. 삭제하시겠습니까?"
      : "댓글을 삭제하시겠습니까?";

    if (window.confirm(message)) {
      await deleteCommentMutation.mutateAsync(commentId);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-500">댓글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <p className="text-red-600 mb-2">
              {error instanceof Error
                ? error.message
                : "댓글을 불러오는데 실패했습니다"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { currentUser } = data;

  // 댓글 제출
  const handleSubmitComment = async () => {
    if (!currentUser || !newComment.trim() || addCommentMutation.isPending)
      return;

    const optimisticNewComment: Comment = {
      id: `temp-${Date.now()}`,
      content: newComment,
      createdAt: new Date().toISOString(),
      author: currentUser,
      replies: [],
    };

    const currentContent = newComment;
    setNewComment("");

    startTransition(async () => {
      addOptimisticComment(optimisticNewComment);

      try {
        await addCommentMutation.mutateAsync({ content: currentContent });
        setFocusNewComment(false);
      } catch (error) {
        console.error("댓글 작성 실패:", error);
        setNewComment(currentContent);
      }
    });
  };

  // 답글 제출
  const handleSubmitReply = async (parentId: string) => {
    if (!currentUser || !replyContent.trim() || addCommentMutation.isPending)
      return;

    const optimisticReply: Comment = {
      id: `temp-${Date.now()}`,
      content: replyContent,
      createdAt: new Date().toISOString(),
      author: currentUser,
      replies: [],
      parentId,
    };

    const currentContent = replyContent;
    setReplyContent("");
    setReplyingTo(null);
    setFocusReply(null);

    startTransition(async () => {
      addOptimisticComment(optimisticReply);

      try {
        await addCommentMutation.mutateAsync({
          content: currentContent,
          parentId,
        });
      } catch (error) {
        console.error("답글 작성 실패:", error);
        setReplyContent(currentContent);
        setReplyingTo(parentId);
      }
    });
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      callback();
    }
  };

  // 댓글 아이템 렌더링
  const renderComment = (comment: Comment, isReply = false) => {
    const isOptimistic = comment.id.startsWith("temp-");
    const isExpanded = expandedReplies.has(comment.id);
    const isDeleting = deletingCommentId === comment.id;
    const canDelete =
      currentUser && currentUser.id === comment.author.id && !comment.isDeleted;

    return (
      <div key={comment.id} className="space-y-6">
        <div
          className={`z-10 flex gap-1.5 ${isOptimistic ? "opacity-60" : ""} ${
            isReply ? "ml-10" : ""
          } ${isDeleting ? "opacity-50" : ""}`}
        >
          {/* 프로필 이미지, 닉네임, 작성일시 */}
          <div className="h-10 flex items-center gap-2 mb-0.5">
            <div
              className={`w-8 flex flex-col z-20 ${
                !comment.isDeleted ? "cursor-pointer" : ""
              }`}
              onClick={() =>
                !comment.isDeleted &&
                router.push(`/players/${comment.author.id}`)
              }
            >
              {!comment.isDeleted && comment.author.image ? (
                <Image
                  src={comment.author.image}
                  alt={comment.author.name || ""}
                  width={32}
                  height={32}
                  className="size-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={16} className="text-gray-500" />
                </div>
              )}
            </div>
          </div>

          {/* 댓글 내용, 답글 버튼, 답글 수 */}
          <div className="flex-1 min-w-0">
            {/* 닉네임, 작성일시 */}
            <div className="flex items-center gap-1.5 mb-1">
              {!comment.isDeleted ? (
                <>
                  <span
                    className="sm:text-sm font-medium hover:underline hover:underline-offset-2 cursor-pointer"
                    onClick={() => router.push(`/players/${comment.author.id}`)}
                  >
                    {comment.author.nickname || comment.author.name}
                  </span>
                  <span className="text-sm sm:text-xs text-gray-500 tracking-tight">
                    {isOptimistic ? (
                      <span className="flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" />
                        전송 중...
                      </span>
                    ) : (
                      new Date(comment.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })
                    )}
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">삭제된 댓글</span>
              )}
            </div>

            {/* 댓글 내용 */}
            <p
              className={`whitespace-pre-wrap sm:text-sm font-medium px-3 py-1.5 rounded-md ${
                comment.isDeleted
                  ? "text-gray-500 bg-gray-100 italic"
                  : "text-gray-700 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {comment.content}
            </p>

            {!isReply &&
              !isOptimistic &&
              (comment.replies.length > 0 || currentUser) && (
                <div className="flex items-center justify-between mt-3 h-4">
                  <div className="flex items-center gap-4">
                    {currentUser && !comment.isDeleted && (
                      <button
                        onClick={() => handleReplyClick(comment.id)}
                        disabled={addCommentMutation.isPending}
                        className="text-sm flex items-center gap-1 justify-center disabled:opacity-50 cursor-pointer font-medium"
                      >
                        <PencilLine className="size-4 text-gray-500" />
                        답글 쓰기
                      </button>
                    )}
                    {comment.replies.length > 0 && (
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="text-sm flex items-center gap-1 justify-center cursor-pointer font-medium"
                      >
                        <MessageSquareText className="size-4 text-gray-500" />
                        답글 {comment.replies.length}개
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="size-4 text-gray-500" />
                        )}
                      </button>
                    )}
                  </div>
                  {canDelete && (
                    <button
                      onClick={() =>
                        handleDeleteComment(
                          comment.id,
                          comment.replies.length > 0
                        )
                      }
                      disabled={isDeleting}
                      className="text-sm flex items-center gap-1 text-gray-500 disabled:opacity-50 cursor-pointer px-2"
                    >
                      삭제
                    </button>
                  )}
                </div>
              )}

            {/* 답글인 경우 삭제 버튼 */}
            {isReply && canDelete && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleDeleteComment(comment.id, false)}
                  disabled={isDeleting}
                  className="text-sm flex items-center gap-1 text-gray-500 disabled:opacity-50 cursor-pointer px-2"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 답글 작성 폼 */}
        {replyingTo === comment.id && currentUser && (
          <div className="ml-10 space-y-1 border-b pb-4">
            <textarea
              ref={(el) => {
                if (el) replyRefs.current[comment.id] = el;
              }}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyPress={(e) =>
                handleKeyPress(e, () => handleSubmitReply(comment.id))
              }
              placeholder="답글을 입력하세요..."
              className="w-full px-4 py-3 border border-gray-400 rounded-md resize-none focus:ring-4 focus:ring-gray-200 focus:!border-gray-500 focus:!outline-none sm:scrollbar-hide"
              rows={2}
              disabled={addCommentMutation.isPending}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                  setFocusReply(null);
                }}
                disabled={addCommentMutation.isPending}
                className="px-4 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 cursor-pointer hover:bg-gray-50 rounded-full"
              >
                취소
              </button>
              <button
                onClick={() => handleSubmitReply(comment.id)}
                disabled={!replyContent.trim() || addCommentMutation.isPending}
                className="px-4 h-11 sm:h-9 sm:text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-default flex items-center gap-1 font-semibold"
              >
                {addCommentMutation.isPending ? "답글 저장 중..." : "저장"}
              </button>
            </div>
          </div>
        )}

        {/* 답글 목록 */}
        {comment.replies.length > 0 &&
          isExpanded &&
          comment.replies.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  const isSubmitting = addCommentMutation.isPending || isPending;

  return (
    <div className="px-4">
      <div className="flex justify-between items-center py-2 min-h-13">
        <div className="flex items-center gap-2">
          <ChatCircleDotsIcon weight="fill" className="size-7 text-zinc-500" />
          <h2 className="text-xl font-semibold">댓글</h2>
        </div>
      </div>

      {/* 댓글 작성 폼 */}
      {!focusNewComment ? (
        <div className={optimisticComments.length === 0 ? "mb-2" : "mb-4"}>
          <button
            type="button"
            className="cursor-pointer rounded-md flex justify-center items-center gap-2 px-4 h-12 sm:h-11 font-semibold bg-white border border-gray-400 transition-shadow shadow-xs hover:shadow-md w-full mb-3"
            onClick={() => {
              if (currentUser) {
                setFocusNewComment(true);
              } else {
                router.push("/login");
              }
            }}
          >
            <PencilLine className="w-5 h-5 text-gray-600" />
            <span>댓글 쓰기</span>
          </button>
        </div>
      ) : (
        <div
          className={`pb-4 border-b flex items-start gap-2 ${
            optimisticComments.length === 0 ? "mb-2" : "mb-4"
          }`}
        >
          <div className="flex-1 space-y-1">
            <textarea
              ref={newCommentRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleSubmitComment)}
              placeholder="댓글을 입력하세요..."
              className="w-full px-4 py-3 border border-gray-400 rounded-md resize-none focus:ring-4 focus:ring-gray-200 focus:!border-gray-500 focus:!outline-none sm:scrollbar-hide"
              rows={3}
              disabled={isSubmitting}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setFocusNewComment(false)}
                disabled={isSubmitting}
                className="px-4 h-11 sm:h-9 text-gray-500 rounded-full hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-default flex items-center gap-2 font-medium cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 h-11 sm:h-9 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-default flex items-center gap-2 font-medium cursor-pointer"
              >
                {isSubmitting ? "댓글 저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 목록 */}
      {optimisticComments.length === 0 ? (
        <div className="py-6 px-8 bg-gray-50 flex flex-col sm:items-center justify-center sm:gap-0.5 rounded-2xl min-h-16 text-gray-500">
          <p className="text-lg sm:text-base font-medium text-gray-600">
            댓글이 없습니다.
          </p>
          <p className="whitespace-pre-line break-keep sm:text-sm">
            일정에 대한 문의 또는 다양한 의견을 남겨보세요.
          </p>
        </div>
      ) : (
        <div className="relative space-y-6 mt-6">
          {optimisticComments.map((comment) => renderComment(comment))}
          <div className="absolute top-4 -bottom-8 left-0 border-r w-4 z-0" />
          <div className="absolute translate-x-1/2 -bottom-4 left-2 size-2 bg-gray-100 rounded-full z-0" />
        </div>
      )}
    </div>
  );
};

export default ScheduleComments;
