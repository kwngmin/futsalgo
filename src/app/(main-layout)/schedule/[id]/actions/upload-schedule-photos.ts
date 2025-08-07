"use server";

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export const uploadSchedulePhotos = async ({
  scheduleId,
  userId,
  url,
}: {
  scheduleId: string;
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
    const updatedSchedulePhoto = await prisma.schedulePhoto.create({
      data: {
        scheduleId,
        uploaderId: userId,
        url,
      },
    });

    // 4. 관련 페이지 캐시 무효화
    revalidatePath(`/schedule/${scheduleId}`);

    // 5. 성공 로그 (선택사항)
    console.log(`Schedule photo uploaded: ${userId}`);

    return {
      success: true,
      schedulePhoto: updatedSchedulePhoto,
      message: "사진이 성공적으로 업로드되었습니다.",
    };
  } catch (error) {
    // 6. 에러 로깅 및 처리
    console.error("Schedule photo upload failed:", {
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

    throw new Error("사진 업로드 중 오류가 발생했습니다.");
  }
};

export default uploadSchedulePhotos;
