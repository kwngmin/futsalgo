"use client";

import React, { useState, useOptimistic, useTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Reply, User, Loader2, AlertCircle } from "lucide-react";
import {
  addComment,
  getScheduleComments,
} from "../actions/get_schedule_comments";
import Image from "next/image";

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
  currentUser: User;
}

interface ScheduleCommentsProps {
  scheduleId: string;
}

const ScheduleComments: React.FC<ScheduleCommentsProps> = ({ scheduleId }) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const queryClient = useQueryClient();

  // 댓글 데이터 조회
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["schedule-comments", scheduleId],
    queryFn: () => getScheduleComments(scheduleId),
    staleTime: 30000, // 30초
    gcTime: 5 * 60 * 1000, // 5분
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
      // 캐시 업데이트
      queryClient.setQueryData(
        ["schedule-comments", scheduleId],
        (oldData: ScheduleCommentsData | undefined) => {
          if (!oldData) return oldData;

          if (newComment.parentId) {
            // 대댓글 추가
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
            // 새 댓글 추가
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
      // 에러 시 데이터 다시 조회
      refetch();
    },
  });

  // Optimistic updates를 위한 hook
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    data?.comments || [],
    (state: Comment[], newComment: Comment) => {
      if (newComment.parentId) {
        // 대댓글 추가
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
        // 새 댓글 추가
        return [...state, newComment];
      }
    }
  );

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

  const { schedule, currentUser } = data;

  // 사용자가 어떤 팀에 속하는지 확인
  const getUserTeamType = (userId: string) => {
    const isHostTeamMember = schedule.hostTeam.members.some(
      (member) => member.userId === userId
    );
    const isInvitedTeamMember = schedule.invitedTeam?.members.some(
      (member) => member.userId === userId
    );

    if (isHostTeamMember) return "HOST";
    if (isInvitedTeamMember) return "INVITED";
    return null;
  };

  // 댓글 제출
  const handleSubmitComment = async () => {
    if (!newComment.trim() || addCommentMutation.isPending) return;

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
      } catch (error) {
        console.error("댓글 작성 실패:", error);
        // 실패 시 입력값 복원
        setNewComment(currentContent);
      }
    });
  };

  // 대댓글 제출
  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || addCommentMutation.isPending) return;

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

    startTransition(async () => {
      addOptimisticComment(optimisticReply);

      try {
        await addCommentMutation.mutateAsync({
          content: currentContent,
          parentId,
        });
      } catch (error) {
        console.error("대댓글 작성 실패:", error);
        // 실패 시 상태 복원
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

  // 팀 배지 렌더링
  const renderTeamBadge = (userId: string) => {
    const teamType = getUserTeamType(userId);

    if (teamType === "HOST") {
      return (
        <span className="tracking-tight text-sm sm:text-xs text-muted-foreground">
          {`${schedule.hostTeam.name} • 주최팀`}
        </span>
      );
    }

    if (teamType === "INVITED" && schedule.invitedTeam) {
      return (
        <span className="tracking-tight text-sm sm:text-xs text-muted-foreground">
          {`${schedule.hostTeam.name} • 초청팀`}
        </span>
      );
    }

    return null;
  };

  // 댓글 아이템 렌더링
  const renderComment = (comment: Comment, isReply = false) => {
    // 임시 댓글인지 확인 (Optimistic update)
    const isOptimistic = comment.id.startsWith("temp-");

    return (
      <div
        key={comment.id}
        className={`${isReply ? "bg-gray-50 border-l-4 border-gray-200" : ""}`}
      >
        <div className={` ${isOptimistic ? "opacity-60" : ""}`}>
          <div className="flex items-start gap-2 p-4 border-t">
            <div className="flex-shrink-0 mt-0.5 sm:mt-0">
              {comment.author.image ? (
                <Image
                  src={comment.author.image}
                  alt={comment.author.name || ""}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={16} className="text-gray-500" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col mb-1.5">
                <div className="flex justify-between items-center gap-2">
                  <span className="sm:text-sm font-medium text-gray-700 leading-tight">
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
                        // year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })
                    )}
                  </span>
                </div>
                {renderTeamBadge(comment.author.id)}
              </div>

              <p className="text-gray-700 whitespace-pre-wrap sm:text-sm font-medium">
                {comment.content}
              </p>

              {!isReply && !isOptimistic && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  disabled={addCommentMutation.isPending}
                  className="mt-2 sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50 cursor-pointer font-semibold bg-blue-50 hover:bg-blue-100 pl-2 pr-3 rounded-full h-9 sm:h-8"
                >
                  <Reply size={16} />
                  대댓글
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 대댓글 작성 폼 */}
        {replyingTo === comment.id && (
          <div className="py-4 border-t">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyPress={(e) =>
                handleKeyPress(e, () => handleSubmitReply(comment.id))
              }
              placeholder="대댓글을 입력하세요..."
              className="w-full px-4 py-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={addCommentMutation.isPending}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
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
                {addCommentMutation.isPending
                  ? "대댓글 저장 중..."
                  : "대댓글 달기"}
              </button>
            </div>
          </div>
        )}

        {/* 대댓글 목록 */}
        {comment.replies.length > 0 &&
          comment.replies.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  const isSubmitting = addCommentMutation.isPending || isPending;

  return (
    <div className="max-w-4xl py-4 sm:px-4">
      {/* 헤더 */}
      {/* <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle size={20} />
          댓글 ({optimisticComments.length})
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {schedule.hostTeam.name} vs {schedule.invitedTeam?.name || "미정"}
        </p>
      </div> */}

      {/* 댓글 작성 폼 */}
      <div className="px-4 pb-4">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            {currentUser.image ? (
              <Image
                src={currentUser.image}
                alt={currentUser.name || ""}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={16} className="text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleSubmitComment)}
              placeholder="댓글을 입력하세요..."
              className="w-full px-4 py-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={isSubmitting}
            />

            <div className="flex justify-end">
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 h-11 sm:h-9  bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-default flex items-center gap-2 font-medium"
              >
                {isSubmitting ? "댓글 저장 중..." : "댓글 달기"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 목록 */}
      {optimisticComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
          <p>아직 댓글이 없습니다.</p>
          <p className="text-sm">첫 번째 댓글을 달아보세요!</p>
        </div>
      ) : (
        optimisticComments.map((comment) => renderComment(comment))
      )}
    </div>
  );
};

export default ScheduleComments;
