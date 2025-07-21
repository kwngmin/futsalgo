// shared/lib/auth/has-manageable-team.ts

"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

/**
 * 현재 로그인한 사용자가 OWNER 또는 MANAGER 권한을 가진 팀이 있는지 확인
 *
 * @returns 사용자가 권한 있는 팀을 갖고 있는지 여부 (boolean)
 */
export async function getManageableTeams(): Promise<boolean> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return false;

  const player = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      teams: {
        where: {
          status: "APPROVED",
          OR: [{ role: "OWNER" }, { role: "MANAGER" }],
        },
      },
    },
  });

  return (player?.teams?.length ?? 0) > 0;
}
