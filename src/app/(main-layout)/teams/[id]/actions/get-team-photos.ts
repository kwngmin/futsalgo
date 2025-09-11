"use server";

import { prisma } from "@/shared/lib/prisma";
// import { auth } from "@/shared/lib/auth";

// 팀과 관련된 사진 데이터 타입
export interface TeamPhotoWithScheduleAndUploader {
  id: string;
  url: string;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
    nickname?: string;
    image?: string;
  };
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
export interface GetTeamPhotosResult {
  success: boolean;
  photos: TeamPhotoWithScheduleAndUploader[];
  totalCount: number;
  hasMore: boolean;
  message?: string;
}

interface GetTeamPhotosParams {
  teamId: string;
  limit?: number;
  offset?: number;
}

export async function getTeamPhotos({
  teamId,
  limit = 20,
  offset = 0,
}: GetTeamPhotosParams): Promise<GetTeamPhotosResult> {
  try {
    // 현재 사용자 확인 (선택사항 - 공개 프로필이라면 제거 가능)
    // const session = await auth();

    // 팀 존재 여부 확인
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true },
    });

    if (!team) {
      return {
        success: false,
        photos: [],
        totalCount: 0,
        hasMore: false,
        message: "팀을 찾을 수 없습니다.",
      };
    }

    // 해당 팀이 참여한 경기들에서 업로드된 사진들 조회
    // (호스트팀 또는 초대팀으로 참여한 경기의 사진들)
    const totalCount = await prisma.schedulePhoto.count({
      where: {
        schedule: {
          OR: [{ hostTeamId: teamId }, { invitedTeamId: teamId }],
        },
      },
    });

    // 사진 목록 조회 (최신순)
    const photos = await prisma.schedulePhoto.findMany({
      where: {
        schedule: {
          OR: [{ hostTeamId: teamId }, { invitedTeamId: teamId }],
        },
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
          },
        },
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
    const transformedPhotos: TeamPhotoWithScheduleAndUploader[] = photos.map(
      (photo) => ({
        id: photo.id,
        url: photo.url,
        createdAt: photo.createdAt.toISOString(),
        uploader: {
          id: photo.uploader.id,
          name: photo.uploader.name || "",
          nickname: photo.uploader.nickname || undefined,
          image: photo.uploader.image || undefined,
        },
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
      })
    );

    const hasMore = offset + photos.length < totalCount;

    return {
      success: true,
      photos: transformedPhotos,
      totalCount,
      hasMore,
    };
  } catch (error) {
    console.error("Failed to get team photos:", error);
    return {
      success: false,
      photos: [],
      totalCount: 0,
      hasMore: false,
      message: "사진을 불러오는데 실패했습니다.",
    };
  }
}
