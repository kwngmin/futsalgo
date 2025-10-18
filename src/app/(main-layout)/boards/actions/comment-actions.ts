"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    nickname: string | null;
    image: string | null;
  };
  replies?: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      nickname: string | null;
      image: string | null;
    };
  }[];
}

export interface GetCommentsResponse {
  success: boolean;
  data?: Comment[];
  error?: string;
}

export interface CreateCommentResponse {
  success: boolean;
  data?: Comment;
  error?: string;
}

/**
 * 게시글의 댓글 목록 조회
 * @param postId - 게시글 ID
 * @returns 댓글 목록
 */
export async function getComments(
  postId: string
): Promise<GetCommentsResponse> {
  try {
    const comments = await prisma.postComment.findMany({
      where: {
        postId,
        isDeleted: false,
        parentId: null, // 최상위 댓글만
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            image: true,
          },
        },
        replies: {
          where: { isDeleted: false },
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: comments,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      success: false,
      error: "Failed to fetch comments",
    };
  }
}

/**
 * 새 댓글 작성
 * @param postId - 게시글 ID
 * @param content - 댓글 내용
 * @param parentId - 부모 댓글 ID (답글인 경우)
 * @returns 생성된 댓글 정보
 */
export async function createComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<CreateCommentResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!content) {
      return { success: false, error: "Content is required" };
    }

    // 게시글 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, isDeleted: true },
    });

    if (!post || post.isDeleted) {
      return { success: false, error: "Post not found" };
    }

    // 답글인 경우 부모 댓글 존재 확인
    if (parentId) {
      const parentComment = await prisma.postComment.findUnique({
        where: { id: parentId },
        select: { id: true, isDeleted: true },
      });

      if (!parentComment || parentComment.isDeleted) {
        return { success: false, error: "Parent comment not found" };
      }
    }

    const comment = await prisma.postComment.create({
      data: {
        content,
        postId,
        authorId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            image: true,
          },
        },
      },
    });

    // 캐시 무효화
    revalidatePath(`/boards/${postId}`);

    return {
      success: true,
      data: comment,
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      success: false,
      error: "Failed to create comment",
    };
  }
}

/**
 * 댓글 수정
 * @param commentId - 댓글 ID
 * @param content - 수정할 내용
 * @returns 수정 결과
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!content) {
      return { success: false, error: "Content is required" };
    }

    // 댓글 존재 및 작성자 확인
    const existingComment = await prisma.postComment.findUnique({
      where: { id: commentId },
      select: { authorId: true, isDeleted: true, postId: true },
    });

    if (!existingComment || existingComment.isDeleted) {
      return { success: false, error: "Comment not found" };
    }

    if (existingComment.authorId !== session.user.id) {
      return { success: false, error: "Forbidden" };
    }

    await prisma.postComment.update({
      where: { id: commentId },
      data: { content },
    });

    // 캐시 무효화
    revalidatePath(`/boards/${existingComment.postId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating comment:", error);
    return {
      success: false,
      error: "Failed to update comment",
    };
  }
}

/**
 * 댓글 삭제
 * @param commentId - 댓글 ID
 * @returns 삭제 결과
 */
export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // 댓글 존재 및 작성자 확인
    const existingComment = await prisma.postComment.findUnique({
      where: { id: commentId },
      select: {
        authorId: true,
        isDeleted: true,
        postId: true,
        replies: {
          where: { isDeleted: false },
          select: { id: true },
        },
      },
    });

    if (!existingComment || existingComment.isDeleted) {
      return { success: false, error: "Comment not found" };
    }

    if (existingComment.authorId !== session.user.id) {
      return { success: false, error: "Forbidden" };
    }

    // 답글이 있는 경우 소프트 삭제, 없는 경우 하드 삭제
    if (existingComment.replies.length > 0) {
      await prisma.postComment.update({
        where: { id: commentId },
        data: {
          isDeleted: true,
          content: "삭제된 댓글입니다",
        },
      });
    } else {
      await prisma.postComment.delete({
        where: { id: commentId },
      });
    }

    // 캐시 무효화
    revalidatePath(`/boards/${existingComment.postId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: "Failed to delete comment",
    };
  }
}
