"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreatePostResponse {
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
    _count: {
      comments: number;
      likes: number;
    };
  };
  error?: string;
}

/**
 * 새 게시글 작성
 * @param title - 게시글 제목
 * @param content - 게시글 내용
 * @param boardId - 게시판 ID
 * @returns 생성된 게시글 정보
 */
export async function createPost(
  title: string,
  content: string,
  boardId: string = "free"
): Promise<CreatePostResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!title || !content) {
      return { success: false, error: "Title and content are required" };
    }

    // 자유게시판 ID 처리
    let targetBoardId = boardId;
    if (boardId === "free") {
      const freeBoard = await prisma.board.findFirst({
        where: { category: "FREE" },
      });

      if (!freeBoard) {
        const newFreeBoard = await prisma.board.create({
          data: {
            name: "자유게시판",
            slug: "free",
            category: "FREE",
            description: "자유롭게 소통할 수 있는 게시판입니다.",
          },
        });
        targetBoardId = newFreeBoard.id;
      } else {
        targetBoardId = freeBoard.id;
      }
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        boardId: targetBoardId,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    // 캐시 무효화
    revalidatePath("/boards");

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      error: "Failed to create post",
    };
  }
}
