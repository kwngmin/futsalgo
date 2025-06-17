import { prisma } from "@/shared/lib/prisma";

// 6자리 코드 생성 + 중복 검사
export async function generateTeamCode(): Promise<string> {
  let code: string = "";
  let exists = true;

  while (exists) {
    code = String(Math.floor(100000 + Math.random() * 900000));
    exists = Boolean(await prisma.team.findUnique({ where: { code } }));
  }

  return code;
}
