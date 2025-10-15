// shared/lib/auth-utils.ts
import { prisma } from "@/shared/lib/prisma";
import { auth } from "./auth";

/**
 * 현재 세션의 사용자가 탈퇴했는지 확인
 */
export async function checkUserDeleted(): Promise<{
  isDeleted: boolean;
  userId?: string;
}> {
  const session = await auth();

  if (!session?.user?.id) {
    return { isDeleted: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isDeleted: true },
  });

  return {
    isDeleted: user?.isDeleted ?? false,
    userId: session.user.id,
  };
}

/**
 * API 라우트에서 사용하는 인증 체크 (탈퇴 확인 포함)
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  // 탈퇴 여부 확인
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isDeleted: true },
  });

  if (user?.isDeleted) {
    throw new Error("탈퇴한 사용자입니다.");
  }

  return session.user;
}

/**
 * 서버 액션에서 사용하는 간편한 체크 함수
 */
export async function getAuthUser() {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}
