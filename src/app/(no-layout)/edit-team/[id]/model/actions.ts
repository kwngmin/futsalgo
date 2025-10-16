"use server";

import { prisma } from "@/shared/lib/prisma";
import { EditTeamFormData } from "../ui/EditTeamForm";
import { revalidatePath } from "next/cache";

export const updateTeam = async ({
  teamId,
  data,
}: {
  teamId: string;
  data: EditTeamFormData;
}) => {
  if (!teamId || !data) {
    throw new Error("필수 정보가 누락되었습니다.");
  }

  try {
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...data,
        updatedAt: new Date(), // 명시적으로 업데이트 시간 갱신
      },
    });

    // 4. 관련 페이지 캐시 무효화
    revalidatePath(`/teams/${teamId}`);
    revalidatePath("/teams"); // 팀 목록 페이지도 갱신

    // 5. 성공 로그 (선택사항)
    // console.log(`Team logo updated: ${teamId} by user: ${userId}`);

    return {
      success: true,
      team: updatedTeam,
      message: "팀 로고가 성공적으로 업데이트되었습니다.",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "팀 정보 업데이트에 실패했습니다." };
  }
};

/**
 * 팀 이름 업데이트 server action
 * @param teamId 팀 ID
 * @param name 새로운 팀 이름
 * @returns 업데이트 결과
 */
export const updateTeamName = async ({
  teamId,
  name,
}: {
  teamId: string;
  name: string;
}) => {
  if (!teamId || !name) {
    return { success: false, error: "필수 정보가 누락되었습니다." };
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return { success: false, error: "팀 이름을 입력해주세요." };
  }

  try {
    // 팀 이름 중복 검사 (현재 팀 제외)
    const existingTeam = await prisma.team.findFirst({
      where: {
        name: trimmedName,
        id: {
          not: teamId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingTeam) {
      return { success: false, error: "이미 사용 중인 팀 이름입니다." };
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: trimmedName,
        updatedAt: new Date(),
      },
    });

    // 관련 페이지 캐시 무효화
    revalidatePath(`/teams/${teamId}`);
    revalidatePath("/teams");

    return {
      success: true,
      team: updatedTeam,
      message: "팀 이름이 성공적으로 변경되었습니다.",
    };
  } catch (error) {
    console.error("팀 이름 업데이트 오류:", error);
    return { success: false, error: "팀 이름 변경에 실패했습니다." };
  }
};
