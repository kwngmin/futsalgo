"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth"; // auth 함수 경로에 맞게 수정
import { revalidatePath } from "next/cache";

export const uploadSchedulePhotos = async ({
  scheduleId,
  urls,
}: {
  scheduleId: string;
  urls: string[];
}) => {
  // 1. 현재 세션 확인
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  // 2. 입력값 유효성 검사
  if (!urls || urls.length === 0) {
    throw new Error("업로드할 사진이 없습니다.");
  }

  // URLs 형식 검증
  const invalidUrls = urls.filter((url) => !url.startsWith("http"));
  if (invalidUrls.length > 0) {
    throw new Error("올바르지 않은 이미지 URL이 포함되어 있습니다.");
  }

  // 최대 업로드 제한 체크
  if (urls.length > 10) {
    throw new Error("한 번에 최대 10장까지만 업로드할 수 있습니다.");
  }

  try {
    // 2. 기존 해당 스케줄의 사진 개수 확인 (선택사항 - 전체 제한을 두고 싶다면)
    const existingPhotosCount = await prisma.schedulePhoto.count({
      where: { scheduleId },
    });

    // 전체 사진이 특정 개수를 초과하지 않도록 제한 (예: 50장)
    if (existingPhotosCount + urls.length > 50) {
      throw new Error(
        `해당 경기에는 최대 50장까지만 업로드할 수 있습니다. (현재: ${existingPhotosCount}장)`
      );
    }

    // 3. 트랜잭션으로 여러 사진 일괄 생성
    const createdPhotos = await prisma.$transaction(async (tx) => {
      const photoPromises = urls.map((url) =>
        tx.schedulePhoto.create({
          data: {
            scheduleId,
            uploaderId: userId,
            url,
          },
        })
      );

      return await Promise.all(photoPromises);
    });

    // 4. 관련 페이지 캐시 무효화
    revalidatePath(`/schedule/${scheduleId}`);

    // 5. 성공 로그
    console.log(
      `${createdPhotos.length} schedule photos uploaded by user: ${userId}`
    );

    return {
      success: true,
      photos: createdPhotos,
      message: `${createdPhotos.length}장의 사진이 성공적으로 업로드되었습니다.`,
    };
  } catch (error) {
    // 6. 에러 로깅 및 처리
    console.error("Schedule photos upload failed:", {
      userId,
      scheduleId,
      urlsCount: urls.length,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Prisma 에러 처리
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        throw new Error("존재하지 않는 스케줄 또는 사용자입니다.");
      }
      if (error.message.includes("권한이 없습니다")) {
        throw error; // 권한 에러는 그대로 전달
      }
      // 이미 정의된 에러 메시지들은 그대로 전달
      if (
        error.message.includes("최대") ||
        error.message.includes("필수") ||
        error.message.includes("올바르지")
      ) {
        throw error;
      }
    }

    throw new Error("사진 업로드 중 오류가 발생했습니다.");
  }
};

export default uploadSchedulePhotos;
