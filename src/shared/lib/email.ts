// utils/email-management.ts
import { prisma } from "@/shared/lib/prisma";

// 사용자 이메일 설정
export async function setUserEmail(userId: string, newEmail: string) {
  try {
    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== userId) {
      return {
        success: false,
        error: "이미 사용 중인 이메일입니다.",
      };
    }

    // 이메일 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    return { success: true };
  } catch (error) {
    console.error("이메일 설정 오류:", error);
    return {
      success: false,
      error: "이메일 설정 중 오류가 발생했습니다.",
    };
  }
}

// 이메일 없는 사용자 조회
export async function getUsersWithoutEmail() {
  return await prisma.user.findMany({
    where: {
      email: null,
      // socialEmail이 있는 경우만 (완전히 새 사용자가 아닌)
      // socialEmail: { not: null }
    },
    select: {
      id: true,
      name: true,
      // socialEmail: true,
      createdAt: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });
}

// 이메일 설정 필요 여부 확인
export async function needsEmailSetup(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  return !user?.email;
}
