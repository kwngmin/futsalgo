import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

/**
 * 댓글 수정
 * @param request - NextRequest 객체
 * @param params - 라우트 파라미터
 * @returns 수정된 댓글 정보
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // 댓글 존재 및 작성자 확인
    const existingComment = await prisma.postComment.findUnique({
      where: { id: commentId },
      select: { authorId: true, isDeleted: true },
    });

    if (!existingComment || existingComment.isDeleted) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existingComment.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedComment = await prisma.postComment.update({
      where: { id: commentId },
      data: { content },
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

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

/**
 * 댓글 삭제
 * @param request - NextRequest 객체
 * @param params - 라우트 파라미터
 * @returns 삭제 결과
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = params;

    // 댓글 존재 및 작성자 확인
    const existingComment = await prisma.postComment.findUnique({
      where: { id: commentId },
      select: {
        authorId: true,
        isDeleted: true,
        replies: {
          where: { isDeleted: false },
          select: { id: true },
        },
      },
    });

    if (!existingComment || existingComment.isDeleted) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existingComment.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 답글이 있는 경우 소프트 삭제, 없는 경우 하드 삭제
    if (existingComment.replies.length > 0) {
      await prisma.postComment.update({
        where: { id: commentId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          content: "삭제된 댓글입니다",
        },
      });
    } else {
      await prisma.postComment.delete({
        where: { id: commentId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
