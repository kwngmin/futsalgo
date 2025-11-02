"use server";

import { cache } from "react";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import {
  TournamentNews,
  TournamentNewsImage,
  User,
  TournamentNewsStatus,
} from "@prisma/client";

export interface TournamentNewsWithDetails extends TournamentNews {
  author: User | null;
  images: TournamentNewsImage[];
}

export interface GetTournamentNewsResponse {
  success: boolean;
  error?: string;
  data?: {
    news: TournamentNewsWithDetails[];
    hasMore?: boolean;
    totalCount?: number;
  };
}

export interface NewsFilters {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  tab?: "all" | "saved"; // "대회 소식" | "찜한 소식"
}

const NEWS_INCLUDE = {
  author: {
    select: {
      id: true,
      nickname: true,
      image: true,
    },
  },
  images: {
    orderBy: {
      order: "asc",
    },
  },
} as const;

/**
 * 대회 소식 조회 - 페이지네이션 지원
 */
export const getTournamentNews = cache(
  async (
    filters: NewsFilters = {}
  ): Promise<GetTournamentNewsResponse> => {
    const startTime = performance.now();
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const tab = filters.tab || "all";

    console.log(`🔍 Fetching tournament news - Page ${page}, Tab: ${tab}`);

    try {
      await prisma.$queryRaw`SELECT 1`;

      const session = await auth();
      const userId = session?.user?.id;

      // 검색 조건
      const searchCondition = filters.searchQuery
        ? {
            OR: [
              {
                title: {
                  contains: filters.searchQuery.trim(),
                  mode: "insensitive" as const,
                },
              },
              {
                content: {
                  contains: filters.searchQuery.trim(),
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {};

      // 기본 where 조건 (삭제되지 않고 게시된 것만)
      const baseWhere = {
        isDeleted: false,
        status: TournamentNewsStatus.PUBLISHED,
        ...searchCondition,
      };

      // 찜한 소식 탭인 경우 (아직 구현되지 않음, 향후 확장 가능)
      const whereCondition =
        tab === "saved" && userId
          ? {
              ...baseWhere,
              // TODO: TournamentNewsLike 모델 추가 후 연결
              // likedBy: {
              //   some: {
              //     userId: userId,
              //   },
              // },
            }
          : baseWhere;

      // 고정된 게시물과 일반 게시물을 분리하여 조회
      const [pinnedNews, regularNews, totalCount] = await Promise.all([
        // 고정 게시물 (첫 페이지에만)
        page === 1
          ? prisma.tournamentNews.findMany({
              where: {
                ...whereCondition,
                isPinned: true,
              },
              include: NEWS_INCLUDE,
              orderBy: { createdAt: "desc" },
              take: 10, // 최대 10개만 고정
            })
          : [],
        // 일반 게시물
        prisma.tournamentNews.findMany({
          where: {
            ...whereCondition,
            isPinned: false,
          },
          include: NEWS_INCLUDE,
          orderBy: { createdAt: "desc" },
          skip: page === 1 ? 0 : skip - 10, // 첫 페이지에서 고정 게시물이 있다면 스킵 조정
          take: pageSize,
        }),
        // 총 개수
        prisma.tournamentNews.count({
          where: whereCondition,
        }),
      ]);

      // 첫 페이지인 경우 고정 게시물 + 일반 게시물 합치기
      // 그 외 페이지는 일반 게시물만
      const allNews =
        page === 1 && pinnedNews.length > 0
          ? [...pinnedNews, ...regularNews]
          : regularNews;

      const endTime = performance.now();
      console.log(
        `✅ Tournament news fetched in ${endTime - startTime}ms (${allNews.length} items)`
      );

      return {
        success: true,
        data: {
          news: allNews as TournamentNewsWithDetails[],
          hasMore: allNews.length === pageSize,
          totalCount,
        },
      };
    } catch (error) {
      console.error("대회 소식 목록 조회 실패:", error);

      if (
        error instanceof Error &&
        error.message.includes("Can't reach database server")
      ) {
        return {
          success: false,
          error:
            "데이터베이스 서버에 연결할 수 없습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.",
        };
      }

      return {
        success: false,
        error: "서버 오류가 발생했습니다",
      };
    }
  }
);

