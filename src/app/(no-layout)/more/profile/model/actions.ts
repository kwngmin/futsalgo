"use server";

import { Profile } from "@/entities/user/model/types";
import { auth } from "@/shared/lib/auth";
import { encrypt, hashEmail, hashPhone } from "@/shared/lib/crypto";
import { prisma } from "@/shared/lib/prisma";
import { User } from "@prisma/client";
import { revalidatePath } from "next/cache";

// 프로필 데이터 타입 정의
export type ProfileData = {
  email?: string;
  phone?: string;
  nickname?: string;
  profile?: Profile;
  ratings?: {
    shooting: number;
    passing: number;
    stamina: number;
    physical: number;
    dribbling: number;
    defense: number;
  };
};

export type ProfileResult = {
  success: boolean;
  error?: string;
  data?: User;
};

// 통합 온보딩 업데이트 함수
export async function updateProfileData(
  data: ProfileData
): Promise<ProfileResult> {
  try {
    // 1. 사용자 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "인증이 필요합니다" };
    }

    const { ratings, ...rest } = data;

    // 2. 데이터 검증
    const validationResult = validateProfileData(rest);
    if (!validationResult.success) {
      return validationResult;
    }

    // 3. DB 업데이트 (부분 업데이트)
    const updateData: Partial<User> = {};
    if (data.email) {
      const emailHashValue = hashEmail(data.email);
      const encryptedEmail = encrypt(data.email);
      updateData.emailHash = emailHashValue;
      updateData.email = encryptedEmail;
    }
    if (data.phone) {
      const phoneHashValue = hashPhone(data.phone);
      const encryptedPhone = encrypt(data.phone);
      updateData.phoneHash = phoneHashValue;
      updateData.phone = encryptedPhone;
    }
    if (data.nickname) updateData.nickname = data.nickname;

    // 프로필 데이터 처리
    if (data.profile) {
      // User 테이블의 직접 필드들
      if (data.profile.name) updateData.name = encrypt(data.profile.name);
      if (data.profile.foot) updateData.foot = data.profile.foot;
      if (data.profile.gender) updateData.gender = data.profile.gender;
      if (data.profile.height) updateData.height = data.profile.height;
      if (data.profile.birthDate) updateData.birthDate = data.profile.birthDate;
      if (data.profile.image) updateData.image = data.profile.image;
      if (data.profile.condition) updateData.condition = data.profile.condition;
      if (data.profile.position) updateData.position = data.profile.position;
      if (data.profile.playerBackground)
        updateData.playerBackground = data.profile.playerBackground;
      if (data.profile.skillLevel)
        updateData.skillLevel = data.profile.skillLevel;

      if (ratings) {
        updateData.shooting = ratings.shooting;
        updateData.passing = ratings.passing;
        updateData.stamina = ratings.stamina;
        updateData.physical = ratings.physical;
        updateData.dribbling = ratings.dribbling;
        updateData.defense = ratings.defense;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    revalidatePath("/profile");

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("프로필 데이터 업데이트 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}

// 개별 필드 업데이트 함수들 (편의성을 위해)
export async function updatePhone(phone: string): Promise<ProfileResult> {
  return updateProfileData({ phone });
}

export async function updateEmail(email: string): Promise<ProfileResult> {
  return updateProfileData({ email });
}

export async function updateNickname(nickname: string): Promise<ProfileResult> {
  return updateProfileData({ nickname });
}

// 데이터 검증 함수
function validateProfileData(data: ProfileData): ProfileResult {
  // 이메일 검증
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: "올바른 이메일 형식이 아닙니다" };
    }
  }

  // 전화번호 검증
  if (data.phone) {
    const phoneRegex = /^01[0-9]\d{7,8}$/;
    // const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
    if (!phoneRegex.test(data.phone)) {
      return { success: false, error: "올바른 전화번호 형식이 아닙니다" };
    }
  }

  // 닉네임 검증
  if (data.nickname) {
    if (data.nickname.length < 2 || data.nickname.length > 20) {
      return { success: false, error: "닉네임은 2-20자 사이여야 합니다" };
    }
  }

  return { success: true };
}

export const updateProfilePhoto = async ({
  userId,
  url,
}: {
  userId: string;
  url: string;
}) => {
  // 1. 입력값 유효성 검사
  if (!userId || !url) {
    throw new Error("필수 정보가 누락되었습니다.");
  }

  // URL 형식 간단 검증 (필요에 따라 더 엄격하게 가능)
  if (!url.startsWith("http")) {
    throw new Error("올바른 이미지 URL이 아닙니다.");
  }

  try {
    // 3. 팀 로고 업데이트
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        image: url,
        updatedAt: new Date(), // 명시적으로 업데이트 시간 갱신
      },
      select: {
        id: true,
        name: true,
        image: true,
        updatedAt: true,
      },
    });

    // 4. 관련 페이지 캐시 무효화
    revalidatePath(`/profile`);
    revalidatePath("/profile"); // 팀 목록 페이지도 갱신

    // 5. 성공 로그 (선택사항)
    console.log(`Profile photo updated: ${userId}`);

    return {
      success: true,
      user: updatedUser,
      message: "프로필 사진이 성공적으로 업데이트되었습니다.",
    };
  } catch (error) {
    // 6. 에러 로깅 및 처리
    console.error("Profile photo update failed:", {
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Prisma 에러 처리
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        throw new Error("존재하지 않는 사용자입니다.");
      }
      if (error.message.includes("권한이 없습니다")) {
        throw error; // 권한 에러는 그대로 전달
      }
    }

    throw new Error("프로필 사진 업데이트 중 오류가 발생했습니다.");
  }
};

export default updateProfilePhoto;
