"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export interface UpdatePostResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    content: string;
    views: number;
    isPinned: boolean;
    createdAt: Date;
    author: {
      id: string;
      nickname: string | null;
      image: string | null;
    };
  };
  error?: string;
}

/**
 * 게시글 수정
 * @param postId - 게시글 ID
 * @param title - 수정할 제목
 * @param content - 수정할 내용
 * @returns 수정된 게시글 정보
 */
export async function updatePost(
  postId: string,
  title: string,
  content: string
): Promise<UpdatePostResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!title || !content) {
      return { success: false, error: "Title and content are required" };
    }

    // 게시글 존재 및 작성자 확인
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, isDeleted: true },
    });

    if (!existingPost || existingPost.isDeleted) {
      return { success: false, error: "Post not found" };
    }

    if (existingPost.authorId !== session.user.id) {
      return { success: false, error: "Forbidden" };
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, content },
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
    revalidatePath("/boards");
    revalidatePath(`/boards/${postId}`);

    return {
      success: true,
      data: updatedPost,
    };
  } catch (error) {
    console.error("Error updating post:", error);
    return {
      success: false,
      error: "Failed to update post",
    };
  }
}
