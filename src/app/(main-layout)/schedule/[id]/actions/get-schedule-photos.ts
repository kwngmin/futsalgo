"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth"; // auth 함수 경로에 맞게 수정

export interface SchedulePhotoWithUploader {
  id: string;
  url: string;
  createdAt: Date;
  uploader: {
    id: string;
    name: string | null;
    nickname: string | null;
    image: string | null;
  };
}

export interface GetSchedulePhotosResult {
  success: boolean;
  photos: SchedulePhotoWithUploader[];
  canUpload: boolean; // 사진 업로드 권한 여부
  totalCount: number;
  hasMore: boolean; // 더 가져올 데이터가 있는지
  message?: string;
}

export const getSchedulePhotos = async ({
  scheduleId,
  limit = 50,
  offset = 0,
}: {
  scheduleId: string;
  limit?: number;
  offset?: number;
}): Promise<GetSchedulePhotosResult> => {
  try {
    // 1. 현재 세션 확인
    const session = await auth();
    const userId = session?.user?.id;

    // 2. 스케줄 존재 여부 확인 및 기본 정보 조회
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        id: true,
        hostTeamId: true,
        invitedTeamId: true,
        hostTeam: {
          select: {
            name: true,
          },
        },
        invitedTeam: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!schedule) {
      return {
        success: false,
        photos: [],
        canUpload: false,
        totalCount: 0,
        hasMore: false,
        message: "존재하지 않는 스케줄입니다.",
      };
    }

    // 3. 사진 업로드 권한 확인 (로그인된 사용자인 경우에만)
    let canUpload = false;
    if (userId) {
      canUpload = await checkUploadPermission(
        userId,
        schedule.hostTeamId,
        schedule.invitedTeamId
      );
    }

    // 4. 전체 사진 개수 조회
    const totalCount = await prisma.schedulePhoto.count({
      where: { scheduleId },
    });

    // 5. 사진 목록 조회 (최신순)
    const photos = await prisma.schedulePhoto.findMany({
      where: { scheduleId },
      select: {
        id: true,
        url: true,
        createdAt: true,
        uploader: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    return {
      success: true,
      photos,
      canUpload,
      totalCount,
      hasMore: offset + photos.length < totalCount, // hasMore 계산 추가
    };
  } catch (error) {
    console.error("Get schedule photos failed:", {
      scheduleId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      success: false,
      photos: [],
      canUpload: false,
      totalCount: 0,
      hasMore: false,
      message: "사진 조회 중 오류가 발생했습니다.",
    };
  }
};

// 사진 업로드 권한 확인 함수
const checkUploadPermission = async (
  userId: string,
  hostTeamId: string,
  invitedTeamId: string | null
): Promise<boolean> => {
  try {
    // 사용자가 호스트 팀 또는 초대받은 팀의 승인된 멤버인지 확인
    const teamIds = [hostTeamId];
    if (invitedTeamId) {
      teamIds.push(invitedTeamId);
    }

    const membership = await prisma.teamMember.findFirst({
      where: {
        userId,
        teamId: {
          in: teamIds,
        },
        status: "APPROVED", // 승인된 멤버만
        banned: false, // 밴 당하지 않은 멤버만
      },
    });

    return !!membership;
  } catch (error) {
    console.error("Check upload permission failed:", error);
    return false;
  }
};

export default getSchedulePhotos;
