"use server";

import { Profile } from "@/entities/user/model/types";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Position, User } from "@prisma/client";
import { revalidatePath } from "next/cache";

// 프로필 데이터 타입 정의
export type ProfileData = {
  email?: string;
  phone?: string;
  nickname?: string;
  profile?: Profile;
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

    // 2. 데이터 검증
    const validationResult = validateProfileData(data);
    if (!validationResult.success) {
      return validationResult;
    }

    // 3. DB 업데이트 (부분 업데이트)
    const updateData: Partial<User> = {};
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.nickname) updateData.nickname = data.nickname;

    // 프로필 데이터 처리
    if (data.profile) {
      // User 테이블의 직접 필드들
      if (data.profile.name) updateData.name = data.profile.name;
      if (data.profile.foot) updateData.foot = data.profile.foot;
      if (data.profile.gender) updateData.gender = data.profile.gender;
      if (data.profile.height) updateData.height = data.profile.height;
      if (data.profile.birthYear) updateData.birthYear = data.profile.birthYear;
      if (data.profile.image) updateData.image = data.profile.image;
      if (data.profile.condition) updateData.condition = data.profile.condition;
      if (data.profile.positions && data.profile.positions.length > 0) {
        updateData.positions = data.profile.positions as Position[];
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
