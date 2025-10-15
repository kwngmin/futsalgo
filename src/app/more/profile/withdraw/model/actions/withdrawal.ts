"use server";

// features/user/lib/withdrawal.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface WithdrawalResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * 회원 탈퇴 처리 (재가입 허용)
 * - Soft Delete 방식
 * - 개인정보 마스킹
 * - 재가입 시 새로운 계정으로 생성됨
 */
export async function withdrawUser(
  userId: string,
  reason?: string
): Promise<WithdrawalResult> {
  try {
    // 1. 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teams: {
          where: {
            status: "APPROVED",
            role: "OWNER",
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      };
    }

    if (user.isDeleted) {
      return {
        success: false,
        message: "이미 탈퇴한 사용자입니다.",
      };
    }

    // 2. 팀장 권한 확인
    if (user.teams.length > 0) {
      return {
        success: false,
        message: "팀장 권한을 다른 멤버에게 위임한 후 탈퇴할 수 있습니다.",
      };
    }

    const now = new Date();

    // 3. 트랜잭션 처리
    await prisma.$transaction(async (tx) => {
      // User 정보 마스킹 및 탈퇴 처리
      await tx.user.update({
        where: { id: userId },
        data: {
          // 탈퇴 표시
          isDeleted: true,
          deletedAt: now,
          deleteReason: reason,

          email: null,
          phone: null,
          name: null,
          nickname: null,
          image: null,
          instagram: null,
          youtube: null,
          birthDate: null,
          height: null,
          weight: null,
        },
      });

      // OAuth 계정 연결 해제 (재가입 시 새 계정 생성 가능하도록)
      await tx.account.deleteMany({
        where: { userId },
      });

      // 세션 삭제
      await tx.session.deleteMany({
        where: { userId },
      });

      // 승인 대기 중인 팀 가입 요청 삭제
      await tx.teamMember.deleteMany({
        where: {
          userId,
          status: "PENDING",
        },
      });

      // 승인된 팀은 탈퇴 처리
      await tx.teamMember.updateMany({
        where: {
          userId,
          status: "APPROVED",
        },
        data: {
          status: "LEAVE",
        },
      });

      // 팔로우 관계 삭제
      await tx.userFollow.deleteMany({
        where: {
          OR: [{ followerId: userId }, { followingId: userId }],
        },
      });

      // 팀 팔로우 삭제
      await tx.teamFollow.deleteMany({
        where: { userId },
      });

      // 미래 일정의 참석 상태를 불참으로 변경
      const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
      await tx.scheduleAttendance.updateMany({
        where: {
          userId,
          schedule: {
            date: { gte: today },
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
        },
        data: {
          attendanceStatus: "NOT_ATTENDING",
        },
      });

      // 대기 중인 매치 초대 거절 처리
      await tx.teamMatchInvitation.updateMany({
        where: {
          schedule: {
            createdById: userId,
          },
          status: "PENDING",
        },
        data: {
          status: "DECLINED",
          reason: "사용자 탈퇴",
        },
      });
    });

    return {
      success: true,
      message: "회원 탈퇴가 완료되었습니다.",
    };
  } catch (error) {
    console.error("회원 탈퇴 오류:", error);
    return {
      success: false,
      message: "회원 탈퇴 처리 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}
