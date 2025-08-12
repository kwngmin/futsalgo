"use client";

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import {
  getTeamPhotos,
  type GetTeamPhotosResult,
  type TeamPhotoWithScheduleAndUploader,
} from "../actions/get-team-photos";

interface UseTeamPhotosOptions {
  teamId: string;
  limit?: number;
  enabled?: boolean; // 쿼리 실행 여부 제어
}

interface UseTeamPhotosReturn {
  photos: TeamPhotoWithScheduleAndUploader[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => Promise<void>;
}

export const useTeamPhotos = ({
  teamId,
  limit = 20,
  enabled = true,
}: UseTeamPhotosOptions): UseTeamPhotosReturn => {
  const queryClient = useQueryClient();

  // 기본 사진 목록 조회
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["teamPhotos", teamId],
    queryFn: () => getTeamPhotos({ teamId, limit, offset: 0 }),
    enabled: enabled && !!teamId,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
  });

  // 추가 사진 로딩을 위한 함수 (무한 스크롤)
  const loadMore = useCallback(async () => {
    if (!data?.success || !data.hasMore) return;

    const currentOffset = data.photos.length;

    try {
      const morePhotos = await getTeamPhotos({
        teamId,
        limit,
        offset: currentOffset,
      });

      if (morePhotos.success && morePhotos.photos.length > 0) {
        // 기존 캐시 데이터에 새로운 사진들을 추가
        queryClient.setQueryData(
          ["teamPhotos", teamId],
          (oldData: GetTeamPhotosResult | undefined) => {
            if (!oldData?.success) return oldData;

            return {
              ...oldData,
              photos: [...oldData.photos, ...morePhotos.photos],
              hasMore:
                currentOffset + morePhotos.photos.length <
                morePhotos.totalCount,
            };
          }
        );
      }
    } catch (error) {
      console.error("Failed to load more photos:", error);
    }
  }, [data, teamId, limit, queryClient]);

  // 새로고침 함수
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // 반환 데이터 가공
  const photos = data?.success ? data.photos : [];
  const totalCount = data?.success ? data.totalCount : 0;
  const hasMore = data?.success ? data.photos.length < data.totalCount : false;
  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "사진을 불러오는데 실패했습니다."
    : !data?.success
    ? data?.message || null
    : null;

  return {
    photos,
    totalCount,
    isLoading,
    error: errorMessage,
    hasMore,
    refresh,
    loadMore,
  };
};

// 사진 캐시 무효화를 위한 헬퍼 함수
export const useInvalidateTeamPhotos = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (teamId: string) => {
      queryClient.invalidateQueries({
        queryKey: ["teamPhotos", teamId],
      });
    },
    [queryClient]
  );
};

export default useTeamPhotos;
