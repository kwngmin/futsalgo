import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "팀 코드가 필요합니다" },
        { status: 400 }
      );
    }

    const existingTeam = await prisma.team.findUnique({
      where: { code },
    });

    return NextResponse.json({ available: !existingTeam });
  } catch (error) {
    console.error("Team code check error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
