import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "전화번호가 필요합니다" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Phone check error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
