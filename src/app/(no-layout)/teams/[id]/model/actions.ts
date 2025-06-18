"use server";

// import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function getTeam(id: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
          },
        },
        members: {
          where: { status: "APPROVED" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                nickname: true,
                image: true,
                skillLevel: true,
                playerBackground: true,
                sportType: true,
                footballPositions: true,
                futsalPosition: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return {
        success: false,
        error: "팀을 찾을 수 없습니다",
        data: null,
      };
    }

    // 실시간 통계 계산
    const approvedMembers = team.members;
    const stats = {
      beginnerCount: approvedMembers.filter(
        (m) => m.user.skillLevel === "BEGINNER"
      ).length,
      amateurCount: approvedMembers.filter(
        (m) => m.user.skillLevel === "AMATEUR"
      ).length,
      aceCount: approvedMembers.filter((m) => m.user.skillLevel === "ACE")
        .length,
      semiproCount: approvedMembers.filter(
        (m) => m.user.skillLevel === "SEMIPRO"
      ).length,
      professionalCount: approvedMembers.filter(
        (m) => m.user.playerBackground === "PROFESSIONAL"
      ).length,
    };

    return {
      success: true,
      data: {
        ...team, // 팀 기본 정보 + members 포함
        stats, // 통계 정보 추가
      },
    };
  } catch (error) {
    console.error("팀 데이터 조회 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
      data: null,
    };
  }
}
