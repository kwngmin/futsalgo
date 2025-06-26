"use server";

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

const updateTeamLogo = async ({
  userId,
  teamId,
  logoUrl,
}: {
  userId: string;
  teamId: string;
  logoUrl: string;
}) => {
  // 1. 입력값 유효성 검사
  if (!userId || !teamId || !logoUrl) {
    throw new Error("필수 정보가 누락되었습니다.");
  }

  // URL 형식 간단 검증 (필요에 따라 더 엄격하게 가능)
  if (!logoUrl.startsWith("http")) {
    throw new Error("올바른 이미지 URL이 아닙니다.");
  }

  try {
    // 2. 사용자 권한 확인 - APPROVED 상태이면서 OWNER 또는 MANAGER 역할인지 검증
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId,
        teamId,
        status: "APPROVED",
        role: {
          in: ["OWNER", "MANAGER"],
        },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!teamMember) {
      throw new Error(
        "팀 로고를 변경할 권한이 없습니다. OWNER 또는 MANAGER 권한이 필요합니다."
      );
    }

    // 3. 팀 로고 업데이트
    const updatedTeam = await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        logoUrl,
        updatedAt: new Date(), // 명시적으로 업데이트 시간 갱신
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        updatedAt: true,
      },
    });

    // 4. 관련 페이지 캐시 무효화
    revalidatePath(`/teams/${teamId}`);
    revalidatePath("/teams"); // 팀 목록 페이지도 갱신

    // 5. 성공 로그 (선택사항)
    console.log(`Team logo updated: ${teamId} by user: ${userId}`);

    return {
      success: true,
      team: updatedTeam,
      message: "팀 로고가 성공적으로 업데이트되었습니다.",
    };
  } catch (error) {
    // 6. 에러 로깅 및 처리
    console.error("Team logo update failed:", {
      userId,
      teamId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Prisma 에러 처리
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        throw new Error("존재하지 않는 팀입니다.");
      }
      if (error.message.includes("권한이 없습니다")) {
        throw error; // 권한 에러는 그대로 전달
      }
    }

    throw new Error("팀 로고 업데이트 중 오류가 발생했습니다.");
  }
};

export default updateTeamLogo;
