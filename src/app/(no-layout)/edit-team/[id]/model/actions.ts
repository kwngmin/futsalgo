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
