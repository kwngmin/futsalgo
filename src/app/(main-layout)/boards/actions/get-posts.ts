"use server";

import { prisma } from "@/shared/lib/prisma";

export interface Post {
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
}

export interface GetPostsResponse {
  success: boolean;
  data?: {
    posts: Post[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
}

/**
 * 게시글 목록 조회 (페이지네이션)
 * @param page - 페이지 번호
 * @param limit - 페이지당 아이템 수
 * @param boardId - 게시판 ID
 * @returns 게시글 목록과 페이지네이션 정보
 */
export async function getPosts(
  page: number = 1,
  limit: number = 20,
  boardId: string = "free"
): Promise<GetPostsResponse> {
  try {
    const skip = (page - 1) * limit;

    // 자유게시판 ID 조회 (또는 기본 자유게시판 생성)
    let freeBoard;
    if (boardId === "free") {
      freeBoard = await prisma.board.findFirst({
        where: { category: "FREE" },
      });

      if (!freeBoard) {
        // 자유게시판이 없으면 생성
        freeBoard = await prisma.board.create({
          data: {
            name: "자유게시판",
            slug: "free",
            category: "FREE",
            description: "자유롭게 소통할 수 있는 게시판입니다.",
          },
        });
      }
    }

    const posts = await prisma.post.findMany({
      where: {
        boardId: boardId === "free" ? freeBoard?.id : boardId,
        isDeleted: false,
        isHidden: false,
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
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    });

    const total = await prisma.post.count({
      where: {
        boardId: boardId === "free" ? freeBoard?.id : boardId,
        isDeleted: false,
        isHidden: false,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      success: false,
      error: "Failed to fetch posts",
    };
  }
}
