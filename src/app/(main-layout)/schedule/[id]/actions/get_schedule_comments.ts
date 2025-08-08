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

/**
 * 스케줄 댓글 데이터 조회
 */
export async function getScheduleComments(
  scheduleId: string
): Promise<ScheduleCommentsData> {
  try {
    // 현재 사용자 확인 (로그인하지 않아도 댓글 조회 가능)
    const session = await auth();

    // 스케줄 정보와 댓글 데이터를 병렬로 조회
    const [schedule, comments] = await Promise.all([
      // 스케줄 정보 조회 (팀 정보 포함)
      prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: {
          hostTeam: {
            select: {
              id: true,
              name: true,
              members: {
                where: {
                  status: "APPROVED", // 승인된 멤버만
                  banned: false, // 밴되지 않은 멤버만
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

      // 댓글 조회 (최상위 댓글만, 대댓글은 replies로 포함)
      prisma.scheduleComment.findMany({
        where: {
          scheduleId,
          parentId: null, // 최상위 댓글만
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
            orderBy: { createdAt: "asc" }, // 대댓글은 작성 순서대로
          },
        },
        orderBy: { createdAt: "asc" }, // 댓글도 작성 순서대로 (오래된 것부터)
      }),
    ]);

    if (!schedule) {
      throw new Error("스케줄을 찾을 수 없습니다");
    }

    // 데이터 변환
    const transformedComments: Comment[] = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.author.id,
        name: comment.author.name || "",
        nickname: comment.author.nickname || undefined,
        image: comment.author.image || undefined,
      },
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        author: {
          id: reply.author.id,
          name: reply.author.name || "",
          nickname: reply.author.nickname || undefined,
          image: reply.author.image || undefined,
        },
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
    // 현재 사용자 확인
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

    // 부모 댓글 존재 확인 (대댓글인 경우)
    if (parentId) {
      const parentComment = await prisma.scheduleComment.findUnique({
        where: { id: parentId },
        select: {
          id: true,
          scheduleId: true,
          parentId: true, // 대댓글의 대댓글 방지
        },
      });

      if (!parentComment) {
        throw new Error("존재하지 않는 댓글입니다");
      }

      if (parentComment.scheduleId !== scheduleId) {
        throw new Error("잘못된 댓글 참조입니다");
      }

      // 대댓글의 대댓글 방지 (2단계 depth만 허용)
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

    // 페이지 재검증 (캐시 무효화)
    revalidatePath(`/schedules/${scheduleId}`);

    // 댓글 데이터 변환하여 반환
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

    // 에러 메시지 정제
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("댓글 작성에 실패했습니다");
  }
}

/**
 * 댓글 삭제 (추가 기능)
 */
export async function deleteComment(commentId: string): Promise<void> {
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
        replies: { select: { id: true } },
      },
    });

    if (!comment) {
      throw new Error("존재하지 않는 댓글입니다");
    }

    if (comment.authorId !== session.user.id) {
      throw new Error("댓글 작성자만 삭제할 수 있습니다");
    }

    // 대댓글이 있는 경우 삭제 방지
    if (comment.replies.length > 0) {
      throw new Error("답글이 있는 댓글은 삭제할 수 없습니다");
    }

    // 댓글 삭제
    await prisma.scheduleComment.delete({
      where: { id: commentId },
    });

    // 페이지 재검증
    revalidatePath(`/schedules/${comment.scheduleId}`);
  } catch (error) {
    console.error("댓글 삭제 실패:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("댓글 삭제에 실패했습니다");
  }
}
