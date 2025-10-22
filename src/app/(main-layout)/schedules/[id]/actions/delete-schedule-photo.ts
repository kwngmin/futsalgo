"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { revalidatePath } from "next/cache";

export interface DeleteSchedulePhotoResult {
  success: boolean;
  message?: string;
}

/**
 * 스케줄 사진 삭제
 * @param photoId 삭제할 사진 ID
 * @returns 삭제 결과
 */
export const deleteSchedulePhoto = async (
  photoId: string
): Promise<DeleteSchedulePhotoResult> => {
  try {
    // 1. 현재 세션 확인
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    // 2. 사진 정보 조회 및 권한 확인
    const photo = await prisma.schedulePhoto.findUnique({
      where: { id: photoId },
      select: {
        id: true,
        uploaderId: true,
        scheduleId: true,
        url: true,
      },
    });

    if (!photo) {
      return {
        success: false,
        message: "존재하지 않는 사진입니다.",
      };
    }

    // 3. 본인이 업로드한 사진인지 확인
    if (photo.uploaderId !== session.user.id) {
      return {
        success: false,
        message: "본인이 업로드한 사진만 삭제할 수 있습니다.",
      };
    }

    // 4. 사진 삭제
    await prisma.schedulePhoto.delete({
      where: { id: photoId },
    });

    // 5. 페이지 새로고침
    revalidatePath(`/schedules/${photo.scheduleId}`);

    return {
      success: true,
      message: "사진이 삭제되었습니다.",
    };
  } catch (error) {
    console.error("Delete schedule photo failed:", {
      photoId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      message: "사진 삭제 중 오류가 발생했습니다.",
    };
  }
};

export default deleteSchedulePhoto;


