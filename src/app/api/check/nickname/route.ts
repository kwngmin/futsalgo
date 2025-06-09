import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { nickname } = await request.json();

    if (!nickname) {
      return NextResponse.json(
        { error: "닉네임이 필요합니다" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { nickname },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Nickname check error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
