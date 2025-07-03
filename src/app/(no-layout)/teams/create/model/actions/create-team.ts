"use server";

import { generateTeamCode } from "@/entities/team/model/actions/generate-team-code";
import { TeamFormData } from "../../ui/TeamsCreateContent";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function createTeam({
  data,
  ownerId,
}: {
  data: TeamFormData;
  ownerId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "인증이 필요합니다" };
  }

  try {
    const team = await prisma.team.create({
      data: {
        ...data,
        code: await generateTeamCode(),
        members: {
          create: {
            userId: ownerId,
            role: "OWNER",
            status: "APPROVED",
          },
        },
      },
    });

    return team;
  } catch (error) {
    console.error("팀 생성 실패:", error);
    return { success: false, error: "팀 생성에 실패했습니다." };
  }
}

// 사용자별 소유 팀 조회
export const getUserOwnedTeams = async (userId: string) => {
  return await prisma.teamMember.findMany({
    where: {
      userId,
      role: "OWNER",
      status: "APPROVED",
    },
    include: { team: true },
  });
};

// // 관리자 권한 확인 (Owner + Manager)
// const hasManagementRole = (role: TeamMemberRole) => {
//   return role === 'OWNER' || role === 'MANAGER';
// };

// // 사용자의 팀 내 권한 확인
// const getUserTeamRole = async (userId: string, teamId: string) => {
//   const member = await prisma.teamMember.findUnique({
//     where: { teamId_userId: { teamId, userId } }
//   });
//   return member?.role;
// };
