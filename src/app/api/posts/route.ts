import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

/**
 * 게시글 목록 조회 (페이지네이션)
 * @param request - NextRequest 객체
 * @returns 게시글 목록과 페이지네이션 정보
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const boardId = searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json(
        { error: "Board ID is required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

/**
 * 새 게시글 작성
 * @param request - NextRequest 객체
 * @returns 생성된 게시글 정보
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, boardId } = body;

    if (!title || !content || !boardId) {
      return NextResponse.json(
        { error: "Title, content, and boardId are required" },
        { status: 400 }
      );
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
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
