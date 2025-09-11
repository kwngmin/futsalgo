"use server";

import { prisma } from "@/shared/lib/prisma";
// import { auth } from "@/shared/lib/auth";

// 회원이 업로드한 사진 데이터 타입
export interface UserPhotoWithSchedule {
  id: string;
  url: string;
  createdAt: string;
  schedule: {
    id: string;
    place: string;
    date: string;
    hostTeam: {
      id: string;
      name: string;
      logoUrl?: string;
    };
    invitedTeam?: {
      id: string;
      name: string;
      logoUrl?: string;
    };
  };
}

// 서버액션 결과 타입
export interface GetUserPhotosResult {
  success: boolean;
  photos: UserPhotoWithSchedule[];
  totalCount: number;
  hasMore: boolean;
  message?: string;
}

interface GetUserPhotosParams {
  userId: string;
  limit?: number;
  offset?: number;
}

export async function getUserPhotos({
  userId,
  limit = 20,
  offset = 0,
}: GetUserPhotosParams): Promise<GetUserPhotosResult> {
  try {
    // 현재 사용자 확인 (선택사항 - 공개 프로필이라면 제거 가능)
    // const session = await auth();

    // 유저 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return {
        success: false,
        photos: [],
        totalCount: 0,
        hasMore: false,
        message: "사용자를 찾을 수 없습니다.",
      };
    }

    // 전체 사진 수 조회
    const totalCount = await prisma.schedulePhoto.count({
      where: {
        uploaderId: userId,
      },
    });

    // 사진 목록 조회 (최신순)
    const photos = await prisma.schedulePhoto.findMany({
      where: {
        uploaderId: userId,
      },
      include: {
        schedule: {
          select: {
            id: true,
            place: true,
            date: true,
            hostTeam: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
            invitedTeam: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // 데이터 변환
    const transformedPhotos: UserPhotoWithSchedule[] = photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      createdAt: photo.createdAt.toISOString(),
      schedule: {
        id: photo.schedule.id,
        place: photo.schedule.place,
        date: photo.schedule.date,
        hostTeam: {
          id: photo.schedule.hostTeam.id,
          name: photo.schedule.hostTeam.name,
          logoUrl: photo.schedule.hostTeam.logoUrl || undefined,
        },
        invitedTeam: photo.schedule.invitedTeam
          ? {
              id: photo.schedule.invitedTeam.id,
              name: photo.schedule.invitedTeam.name,
              logoUrl: photo.schedule.invitedTeam.logoUrl || undefined,
            }
          : undefined,
      },
    }));

    const hasMore = offset + photos.length < totalCount;

    return {
      success: true,
      photos: transformedPhotos,
      totalCount,
      hasMore,
    };
  } catch (error) {
    console.error("Failed to get user photos:", error);
    return {
      success: false,
      photos: [],
      totalCount: 0,
      hasMore: false,
      message: "사진을 불러오는데 실패했습니다.",
    };
  }
}
