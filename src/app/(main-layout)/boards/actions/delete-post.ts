"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export interface DeletePostResponse {
  success: boolean;
  error?: string;
}

/**
 * 게시글 삭제
 * @param postId - 게시글 ID
 * @returns 삭제 결과
 */
export async function deletePost(postId: string): Promise<DeletePostResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // 게시글 존재 및 작성자 확인
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
        isDeleted: true,
        comments: {
          where: { isDeleted: false },
          select: { id: true },
        },
      },
    });

    if (!existingPost || existingPost.isDeleted) {
      return { success: false, error: "Post not found" };
    }

    if (existingPost.authorId !== session.user.id) {
      return { success: false, error: "Forbidden" };
    }

    // 댓글이 있는 경우 소프트 삭제, 없는 경우 하드 삭제
    if (existingPost.comments.length > 0) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          title: "삭제된 게시물입니다",
          content: "삭제된 게시물입니다",
        },
      });
    } else {
      await prisma.post.delete({
        where: { id: postId },
      });
    }

    // 캐시 무효화
    revalidatePath("/boards");
    revalidatePath(`/boards/${postId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return {
      success: false,
      error: "Failed to delete post",
    };
  }
}
