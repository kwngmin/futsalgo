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
                birthDate: true,
                height: true,
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

    // 평균 연령 계산 (birthDate가 있는 멤버들만)
    const membersWithBirthDate = approvedMembers.filter(
      (m) => m.user.birthDate
    );
    const averageAge =
      membersWithBirthDate.length > 0
        ? Math.round(
            membersWithBirthDate.reduce((sum, m) => {
              const birthYear = parseInt(m.user.birthDate!.substring(0, 4));
              const currentYear = new Date().getFullYear();
              return sum + (currentYear - birthYear);
            }, 0) / membersWithBirthDate.length
          )
        : null;

    // 평균 키 계산 (height가 있는 멤버들만)
    const membersWithHeight = approvedMembers.filter((m) => m.user.height);
    const averageHeight =
      membersWithHeight.length > 0
        ? Math.round(
            membersWithHeight.reduce((sum, m) => sum + m.user.height!, 0) /
              membersWithHeight.length
          )
        : null;

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
      averageAge,
      averageHeight,
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
