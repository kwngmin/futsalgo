"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

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
  isDeleted?: boolean; // 삭제 여부 필드 추가
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

/**
 * 스케줄 댓글 데이터 조회
 */
export async function getScheduleComments(
  scheduleId: string
): Promise<ScheduleCommentsData> {
  try {
    const session = await auth();

    // 스케줄 정보와 댓글 데이터를 병렬로 조회
    const [schedule, comments] = await Promise.all([
      // 스케줄 정보 조회
      prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: {
          hostTeam: {
            select: {
              id: true,
              name: true,
              members: {
                where: {
                  status: "APPROVED",
                  banned: false,
                },
                select: {
                  userId: true,
                  teamId: true,
                  role: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      nickname: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
          invitedTeam: {
            select: {
              id: true,
              name: true,
              members: {
                where: {
                  status: "APPROVED",
                  banned: false,
                },
                select: {
                  userId: true,
                  teamId: true,
                  role: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      nickname: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),

      // 댓글 조회 (최상위 댓글과 모든 답글 포함)
      prisma.scheduleComment.findMany({
        where: {
          scheduleId,
          parentId: null,
          // soft delete된 댓글도 조회 (답글이 있을 수 있으므로)
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              nickname: true,
              image: true,
            },
          },
          replies: {
            // 답글은 삭제 여부 관계없이 모두 조회
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  nickname: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    if (!schedule) {
      throw new Error("스케줄을 찾을 수 없습니다");
    }

    // 데이터 변환 - isDeleted 필드 처리
    const transformedComments: Comment[] = comments.map((comment) => ({
      id: comment.id,
      content: comment.isDeleted ? "댓글이 삭제되었습니다" : comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: comment.isDeleted
        ? {
            id: comment.author.id,
            name: "삭제됨",
            nickname: undefined,
            image: undefined,
          }
        : {
            id: comment.author.id,
            name: comment.author.name || "",
            nickname: comment.author.nickname || undefined,
            image: comment.author.image || undefined,
          },
      isDeleted: comment.isDeleted,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.isDeleted ? "댓글이 삭제되었습니다" : reply.content,
        createdAt: reply.createdAt.toISOString(),
        author: reply.isDeleted
          ? {
              id: reply.author.id,
              name: "삭제됨",
              nickname: undefined,
              image: undefined,
            }
          : {
              id: reply.author.id,
              name: reply.author.name || "",
              nickname: reply.author.nickname || undefined,
              image: reply.author.image || undefined,
            },
        isDeleted: reply.isDeleted,
        replies: [],
        parentId: reply.parentId || undefined,
      })),
      parentId: undefined,
    }));

    const transformedSchedule: Schedule = {
      id: schedule.id,
      hostTeamId: schedule.hostTeamId,
      invitedTeamId: schedule.invitedTeamId || undefined,
      hostTeam: {
        id: schedule.hostTeam.id,
        name: schedule.hostTeam.name,
        members: schedule.hostTeam.members.map((member) => ({
          userId: member.userId,
          teamId: member.teamId,
          role: member.role,
          user: {
            id: member.user.id,
            name: member.user.name || "",
            nickname: member.user.nickname || undefined,
            image: member.user.image || undefined,
          },
        })),
      },
      invitedTeam: schedule.invitedTeam
        ? {
            id: schedule.invitedTeam.id,
            name: schedule.invitedTeam.name,
            members: schedule.invitedTeam.members.map((member) => ({
              userId: member.userId,
              teamId: member.teamId,
              role: member.role,
              user: {
                id: member.user.id,
                name: member.user.name || "",
                nickname: member.user.nickname || undefined,
                image: member.user.image || undefined,
              },
            })),
          }
        : undefined,
    };

    return {
      schedule: transformedSchedule,
      comments: transformedComments,
      currentUser: session?.user
        ? {
            id: session.user.id,
            name: session.user.name || "",
            nickname: session.user.nickname || undefined,
            image: session.user.image || undefined,
          }
        : undefined,
    };
  } catch (error) {
    console.error("댓글 데이터 조회 실패:", error);
    throw new Error("댓글 데이터를 불러오는데 실패했습니다");
  }
}

/**
 * 댓글 추가
 */
export async function addComment(
  scheduleId: string,
  content: string,
  parentId?: string
): Promise<Comment> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다");
    }

    // 입력값 검증
    if (!content.trim()) {
      throw new Error("댓글 내용을 입력해주세요");
    }

    if (content.length > 1000) {
      throw new Error("댓글은 1000자를 초과할 수 없습니다");
    }

    // 스케줄 존재 확인
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: { id: true },
    });

    if (!schedule) {
      throw new Error("존재하지 않는 스케줄입니다");
    }

    // 부모 댓글 존재 확인 (답글인 경우)
    if (parentId) {
      const parentComment = await prisma.scheduleComment.findUnique({
        where: { id: parentId },
        select: {
          id: true,
          scheduleId: true,
          parentId: true,
          isDeleted: true,
        },
      });

      if (!parentComment) {
        throw new Error("존재하지 않는 댓글입니다");
      }

      if (parentComment.scheduleId !== scheduleId) {
        throw new Error("잘못된 댓글 참조입니다");
      }

      // 삭제된 댓글에는 답글 불가
      if (parentComment.isDeleted) {
        throw new Error("삭제된 댓글에는 답글을 달 수 없습니다");
      }

      // 답글의 답글 방지
      if (parentComment.parentId) {
        throw new Error("답글에는 답글을 달 수 없습니다");
      }
    }

    // 댓글 생성
    const comment = await prisma.scheduleComment.create({
      data: {
        scheduleId,
        authorId: session.user.id,
        content: content.trim(),
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
          },
        },
      },
    });

    // 페이지 재검증
    revalidatePath(`/schedules/${scheduleId}`);

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.author.id,
        name: comment.author.name || "",
        nickname: comment.author.nickname || undefined,
        image: comment.author.image || undefined,
      },
      replies: [],
      parentId: comment.parentId || undefined,
    };
  } catch (error) {
    console.error("댓글 작성 실패:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("댓글 작성에 실패했습니다");
  }
}

/**
 * 댓글 삭제
 * @returns { softDeleted: boolean } - soft delete 여부
 */
export async function deleteComment(commentId: string): Promise<{
  softDeleted: boolean;
}> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("로그인이 필요합니다");
    }

    // 댓글 존재 및 권한 확인
    const comment = await prisma.scheduleComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
        scheduleId: true,
        isDeleted: true,
        replies: {
          select: {
            id: true,
            isDeleted: true,
          },
        },
      },
    });

    if (!comment) {
      throw new Error("존재하지 않는 댓글입니다");
    }

    if (comment.isDeleted) {
      throw new Error("이미 삭제된 댓글입니다");
    }

    if (comment.authorId !== session.user.id) {
      throw new Error("댓글 작성자만 삭제할 수 있습니다");
    }

    // 삭제되지 않은 답글이 있는지 확인
    const hasActiveReplies = comment.replies.some((reply) => !reply.isDeleted);

    if (hasActiveReplies) {
      // Soft delete: 답글이 있는 경우
      await prisma.scheduleComment.update({
        where: { id: commentId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      revalidatePath(`/schedules/${comment.scheduleId}`);
      return { softDeleted: true };
    } else {
      // Hard delete: 답글이 없거나 모든 답글이 삭제된 경우
      await prisma.scheduleComment.delete({
        where: { id: commentId },
      });

      revalidatePath(`/schedules/${comment.scheduleId}`);
      return { softDeleted: false };
    }
  } catch (error) {
    console.error("댓글 삭제 실패:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("댓글 삭제에 실패했습니다");
  }
}
