"use server";

import { prisma } from "@/shared/lib/prisma";

export interface PostDetail {
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
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      nickname: string | null;
      image: string | null;
    };
    replies: {
      id: string;
      content: string;
      createdAt: Date;
      author: {
        id: string;
        nickname: string | null;
        image: string | null;
      };
    }[];
  }[];
  _count: {
    comments: number;
    likes: number;
  };
}

export interface GetPostResponse {
  success: boolean;
  data?: PostDetail;
  error?: string;
}

/**
 * 특정 게시글 조회
 * @param postId - 게시글 ID
 * @returns 게시글 상세 정보
 */
export async function getPost(postId: string): Promise<GetPostResponse> {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            image: true,
          },
        },
        comments: {
          where: { isDeleted: false, parentId: null },
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
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post || post.isDeleted || post.isHidden) {
      return { success: false, error: "Post not found" };
    }

    // 조회수 증가
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return {
      success: false,
      error: "Failed to fetch post",
    };
  }
}
