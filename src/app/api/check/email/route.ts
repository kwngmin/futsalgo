import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "이메일이 필요합니다" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
