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

// 팀 소유자 조회
/*
const getTeamOwner = async (teamId: string) => {
  return await prisma.teamMember.findFirst({
    where: { 
      teamId, 
      role: 'OWNER',
      status: 'APPROVED' 
    },
    include: { user: true }
  });
};

// 사용자가 소유한 팀들 조회
const getUserOwnedTeams = async (userId: string) => {
  return await prisma.teamMember.findMany({
    where: { 
      userId, 
      role: 'OWNER',
      status: 'APPROVED'
    },
    include: { team: true }
  });
};

// 팀의 모든 관리자 조회 (Owner + Manager)
const getTeamManagers = async (teamId: string) => {
  return await prisma.teamMember.findMany({
    where: { 
      teamId,
      role: { in: ['OWNER', 'MANAGER'] },
      status: 'APPROVED'
    },
    include: { user: true }
  });
};
*/
