"use server";

import { revalidatePath } from "next/cache";
import { TeamMemberRole } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";

// 공통 권한 검증 함수
async function verifyOwnership(teamId: string, userId: string) {
  const member = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!member || member.role !== TeamMemberRole.OWNER) {
    throw new Error("팀장 권한이 필요합니다.");
  }

  return member;
}

// 팀장 변경
export async function changeTeamOwner(teamId: string, newOwnerId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다.");
    }

    // 현재 사용자가 팀장인지 확인
    await verifyOwnership(teamId, session.user.id);

    // 새 팀장이 팀 멤버인지 확인
    const newOwnerMember = await prisma.teamMember.findUnique({
      where: {
        id: newOwnerId,
        teamId,
        status: "APPROVED",
      },
    });

    if (!newOwnerMember) {
      throw new Error("유효한 팀 멤버가 아닙니다.");
    }

    // 트랜잭션으로 역할 변경
    await prisma.$transaction(async (tx) => {
      // 기존 팀장을 일반 멤버로 변경
      await tx.teamMember.update({
        where: {
          teamId_userId: {
            teamId,
            userId: session.user.id,
          },
        },
        data: {
          role: TeamMemberRole.MEMBER,
        },
      });

      // 새 팀장 지정
      await tx.teamMember.update({
        where: {
          id: newOwnerId,
        },
        data: {
          role: TeamMemberRole.OWNER,
        },
      });
    });

    revalidatePath(`/teams/${teamId}`);
    return { success: true, message: "팀장이 변경되었습니다." };
  } catch (error) {
    console.error("팀장 변경 오류:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "팀장 변경에 실패했습니다.",
    };
  }
}

// 부팀장 추가
export async function addTeamManager(teamId: string, memberId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다.");
    }

    // 현재 사용자가 팀장인지 확인
    await verifyOwnership(teamId, session.user.id);

    // 현재 부팀장 수 확인
    const currentManagers = await prisma.teamMember.count({
      where: {
        teamId,
        role: TeamMemberRole.MANAGER,
        status: "APPROVED",
      },
    });

    if (currentManagers >= 2) {
      throw new Error("부팀장은 최대 2명까지만 지정할 수 있습니다.");
    }

    // 대상이 일반 멤버인지 확인
    const targetMember = await prisma.teamMember.findUnique({
      where: {
        id: memberId,
        teamId,
        role: TeamMemberRole.MEMBER,
        status: "APPROVED",
      },
    });

    if (!targetMember) {
      throw new Error("유효한 팀 멤버가 아닙니다.");
    }

    // 부팀장으로 변경
    await prisma.teamMember.update({
      where: {
        id: memberId,
      },
      data: {
        role: TeamMemberRole.MANAGER,
      },
    });

    revalidatePath(`/teams/${teamId}`);
    return { success: true, message: "부팀장이 추가되었습니다." };
  } catch (error) {
    console.error("부팀장 추가 오류:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "부팀장 추가에 실패했습니다.",
    };
  }
}

// 부팀장 해제
export async function removeTeamManager(teamId: string, managerId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다.");
    }

    // 현재 사용자가 팀장인지 확인
    await verifyOwnership(teamId, session.user.id);

    // 대상이 부팀장인지 확인
    const targetManager = await prisma.teamMember.findUnique({
      where: {
        id: managerId,
        teamId,
        role: TeamMemberRole.MANAGER,
        status: "APPROVED",
      },
    });

    if (!targetManager) {
      throw new Error("유효한 부팀장이 아닙니다.");
    }

    // 일반 멤버로 변경
    await prisma.teamMember.update({
      where: {
        id: managerId,
      },
      data: {
        role: TeamMemberRole.MEMBER,
      },
    });

    revalidatePath(`/teams/${teamId}`);
    return { success: true, message: "부팀장이 해제되었습니다." };
  } catch (error) {
    console.error("부팀장 해제 오류:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "부팀장 해제에 실패했습니다.",
    };
  }
}
