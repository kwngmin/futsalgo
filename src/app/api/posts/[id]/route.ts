import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

/**
 * 특정 게시글 조회
 * @param request - NextRequest 객체
 * @param params - 라우트 파라미터
 * @returns 게시글 상세 정보
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

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
          where: { isDeleted: false },
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
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 조회수 증가
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

/**
 * 게시글 수정
 * @param request - NextRequest 객체
 * @param params - 라우트 파라미터
 * @returns 수정된 게시글 정보
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = params.id;
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // 게시글 존재 및 작성자 확인
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, isDeleted: true },
    });

    if (!existingPost || existingPost.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

/**
 * 게시글 삭제
 * @param request - NextRequest 객체
 * @param params - 라우트 파라미터
 * @returns 삭제 결과
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = params.id;

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
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
