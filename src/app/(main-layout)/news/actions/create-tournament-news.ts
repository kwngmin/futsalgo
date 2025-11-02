"use server";

import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import { TournamentNews, TournamentNewsStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateTournamentNewsFormData {
  title: string;
  content: string;
  posterUrl?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  location?: string;
  registrationDeadline?: string; // ISO date string
  websiteUrl?: string;
  registrationUrl?: string;
  imageUrls?: string[]; // 추가 이미지 URL들
}

/**
 * 대회 소식 생성
 */
export async function createTournamentNews(
  formData: CreateTournamentNewsFormData
): Promise<
  | { success: true; data: TournamentNews }
  | { success: false; error: string }
> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "로그인이 필요합니다",
      };
    }

    // 제목과 내용 필수 검증
    if (!formData.title.trim()) {
      return {
        success: false,
        error: "제목을 입력해주세요",
      };
    }

    if (!formData.content.trim()) {
      return {
        success: false,
        error: "내용을 입력해주세요",
      };
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 대회 소식 생성
      const news = await tx.tournamentNews.create({
        data: {
          title: formData.title.trim(),
          content: formData.content.trim(),
          posterUrl: formData.posterUrl || null,
          startDate: formData.startDate
            ? new Date(formData.startDate)
            : null,
          endDate: formData.endDate ? new Date(formData.endDate) : null,
          location: formData.location || null,
          registrationDeadline: formData.registrationDeadline
            ? new Date(formData.registrationDeadline)
            : null,
          websiteUrl: formData.websiteUrl || null,
          registrationUrl: formData.registrationUrl || null,
          status: TournamentNewsStatus.PUBLISHED,
          authorId: session.user.id,
          publishedAt: new Date(),
        },
      });

      // 2. 추가 이미지들 생성 (있는 경우)
      if (formData.imageUrls && formData.imageUrls.length > 0) {
        await tx.tournamentNewsImage.createMany({
          data: formData.imageUrls.map((url, index) => ({
            tournamentNewsId: news.id,
            url: url.trim(),
            order: index,
          })),
        });
      }

      return news;
    });

    // 캐시 무효화
    revalidatePath("/news");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("대회 소식 생성 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}

