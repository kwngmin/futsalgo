"use server";

import { generateTeamCode } from "@/entities/team/model/actions";
import { TeamFormData } from "../ui/TeamsCreateContent";
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
        ownerId,
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
