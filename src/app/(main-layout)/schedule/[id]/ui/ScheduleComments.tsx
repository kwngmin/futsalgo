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
} from "lucide-react";
import {
  addComment,
  getScheduleComments,
} from "../actions/get-schedule-comments";
import Image from "next/image";
import { ChatsIcon } from "@phosphor-icons/react";
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
  currentUser?: User; // 로그인하지 않은 경우 undefined
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
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const router = useRouter();

  // useRef로 textarea 참조
  const newCommentRef = useRef<HTMLTextAreaElement>(null);

  const queryClient = useQueryClient();

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

  // focusNewComment가 true로 변경될 때 포커스 처리
  useEffect(() => {
    if (focusNewComment && newCommentRef.current) {
      // 다음 tick에서 포커스 설정
      setTimeout(() => {
        newCommentRef.current?.focus();
      }, 0);
    }
  }, [focusNewComment]);

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
      // 답글 추가 시 해당 댓글의 답글을 자동으로 펼치기
      if (newComment.parentId) {
        setExpandedReplies((prev) => new Set(prev).add(newComment.parentId!));
      }

      // 캐시 업데이트
      queryClient.setQueryData(
        ["schedule-comments", scheduleId],
        (oldData: ScheduleCommentsData | undefined) => {
          if (!oldData) return oldData;

          if (newComment.parentId) {
            // 답글 추가
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
        // 답글 추가
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

  const {
    // schedule, //
    currentUser,
  } = data;

  // 사용자가 어떤 팀에 속하는지 확인
  // const getUserTeamType = (userId: string) => {
  //   const isHostTeamMember = schedule.hostTeam.members.some(
  //     (member) => member.userId === userId
  //   );
  //   const isInvitedTeamMember = schedule.invitedTeam?.members.some(
  //     (member) => member.userId === userId
  //   );

  //   if (isHostTeamMember) return "HOST";
  //   if (isInvitedTeamMember) return "INVITED";
  //   return null;
  // };

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
      } catch (error) {
        console.error("댓글 작성 실패:", error);
        // 실패 시 입력값 복원
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

    startTransition(async () => {
      addOptimisticComment(optimisticReply);

      try {
        await addCommentMutation.mutateAsync({
          content: currentContent,
          parentId,
        });
      } catch (error) {
        console.error("답글 작성 실패:", error);
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
  // const renderTeamBadge = (userId: string) => {
  //   const teamType = getUserTeamType(userId);

  //   if (teamType === "HOST") {
  //     return (
  //       <span className="tracking-tight text-sm sm:text-xs text-muted-foreground">
  //         {`${schedule.hostTeam.name} • 주최팀`}
  //       </span>
  //     );
  //   }

  //   if (teamType === "INVITED" && schedule.invitedTeam) {
  //     return (
  //       <span className="tracking-tight text-sm sm:text-xs text-muted-foreground">
  //         {`${schedule.invitedTeam.name} • 초청팀`}
  //       </span>
  //     );
  //   }

  //   return null;
  // };

  // 댓글 아이템 렌더링
  const renderComment = (comment: Comment, isReply = false) => {
    // 임시 댓글인지 확인 (Optimistic update)
    const isOptimistic = comment.id.startsWith("temp-");
    const isExpanded = expandedReplies.has(comment.id);

    return (
      <div key={comment.id} className={`${isReply ? "ml-6 px-4 mt-2" : ""}`}>
        <div
          className={`z-10 flex items-stretch gap-2 px-4 sm:px-0 mb-3 ${
            isOptimistic ? "opacity-60" : ""
          }`}
        >
          <div className="h-10 flex items-center">
            <div className="w-8 flex flex-col z-20">
              {comment.author.image ? (
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
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-1.5 h-10">
                  <span
                    className="sm:text-sm font-medium hover:underline hover:underline-offset-2 cursor-pointer"
                    onClick={() => {
                      router.push(`/players/${comment.author.id}`);
                    }}
                  >
                    {comment.author.nickname || comment.author.name}
                  </span>
                  {/* <span className="text-gray-500">•</span> */}
                  <span className="text-sm sm:text-xs text-gray-500 tracking-tight">
                    {/* <span className="text-sm text-muted-foreground"> */}
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
                </div>
              </div>
              {/* {renderTeamBadge(comment.author.id)} */}
            </div>

            <p className="text-gray-700 whitespace-pre-wrap sm:text-sm font-medium bg-gray-50 px-3 py-2 rounded-md">
              {comment.content}
            </p>

            {!isReply && !isOptimistic && (
              <div className="flex items-center gap-1 mt-2">
                {currentUser && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    disabled={addCommentMutation.isPending}
                    className="sm:text-sm flex items-center gap-1 justify-center disabled:opacity-50 cursor-pointer font-medium"
                  >
                    <PencilLine className="size-4.5 sm:size-4 text-gray-500" />
                    답글 쓰기
                  </button>
                )}
                {comment.replies.length > 0 && currentUser && (
                  <span className="text-gray-500 leading-tight">•</span>
                )}
                {comment.replies.length > 0 && (
                  <button
                    onClick={() => toggleReplies(comment.id)}
                    className="sm:text-sm flex items-center gap-1 justify-center cursor-pointer font-medium hover:text-blue-600 transition-colors"
                  >
                    답글 {comment.replies.length}개
                    {isExpanded ? (
                      <ChevronUp className="size-4.5 sm:size-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="size-4.5 sm:size-4 text-gray-500" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* {!isReply && (
          <div className="absolute top-4 -bottom-5 left-4 sm:left-0 border-r w-4 z-0" />
        )} */}

        {/* 답글 작성 폼 */}
        {replyingTo === comment.id && currentUser && (
          <div className="ml-9 px-4 py-2 space-y-1 mb-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyPress={(e) =>
                handleKeyPress(e, () => handleSubmitReply(comment.id))
              }
              placeholder="답글을 입력하세요..."
              className="w-full px-4 py-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={addCommentMutation.isPending}
            />
            <div className="flex justify-end gap-2">
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
                {addCommentMutation.isPending ? "답글 저장 중..." : "저장"}
              </button>
            </div>
          </div>
        )}

        {/* 답글 목록 - 펼쳐진 경우에만 표시 */}
        {comment.replies.length > 0 &&
          isExpanded &&
          comment.replies.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  const isSubmitting = addCommentMutation.isPending || isPending;

  return (
    <div className="max-w-4xl py-4 sm:px-4">
      {/* 댓글 작성 폼 */}

      {currentUser &&
        (!focusNewComment ? (
          <div className="px-4 sm:px-0 mb-4">
            <button
              type="button"
              className="cursor-pointer rounded-md flex justify-center items-center gap-2 px-4 h-11 sm:h-10 font-semibold hover:bg-gray-100 transition-colors bg-white border border-input shadow-xs hover:shadow-sm w-full"
              onClick={() => setFocusNewComment(true)}
            >
              <PencilLine className="w-5 h-5 text-gray-600" />
              <span>댓글 쓰기</span>
            </button>
          </div>
        ) : (
          <div className="px-4 sm:px-0 pb-4 border-b mb-2 flex items-start gap-2">
            <div className="flex-1 space-y-1">
              <textarea
                ref={newCommentRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleSubmitComment)}
                placeholder="댓글을 입력하세요..."
                className="w-full px-4 py-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        ))}

      {/* 댓글 목록 */}
      {optimisticComments.length === 0 ? (
        <div className="text-center min-h-[50vh] flex flex-col items-center justify-center text-gray-500">
          <ChatsIcon
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            weight="duotone"
          />
          <p className="text-lg mb-2 font-medium">댓글이 없습니다.</p>
        </div>
      ) : (
        <div className="relative">
          {optimisticComments.map((comment) => renderComment(comment))}
          <div className="absolute top-4 -bottom-5 left-4 sm:left-0 border-r w-4 z-0" />
          <div className="absolute translate-x-1/2 -bottom-5 left-6 sm:left-2 size-2 bg-gray-200 rounded-full z-0" />
        </div>
      )}
    </div>
  );
};

export default ScheduleComments;
