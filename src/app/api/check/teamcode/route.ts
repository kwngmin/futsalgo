import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamCode } = body;

    // 입력값 검증 강화
    if (!teamCode || typeof teamCode !== "string" || teamCode.trim() === "") {
      return NextResponse.json(
        {
          error: "유효한 팀 코드가 필요합니다",
          available: false,
        },
        { status: 400 }
      );
    }

    // 팀 존재 여부 확인
    const existingTeam = await prisma.team.findUnique({
      where: { code: teamCode.trim() },
      select: { id: true }, // 필요한 필드만 선택하여 성능 최적화
    });

    // 로직 수정: 팀이 존재하면 available은 true (사용 가능)
    return NextResponse.json({
      available: !!existingTeam,
      message: existingTeam
        ? "사용 가능한 팀 코드입니다"
        : "존재하지 않는 팀 코드입니다",
    });
  } catch (error) {
    console.error("Team code validation error:", error);

    // 프로덕션에서 더 자세한 에러 정보 제공
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다",
        available: false,
      },
      { status: 500 }
    );
  }
}
