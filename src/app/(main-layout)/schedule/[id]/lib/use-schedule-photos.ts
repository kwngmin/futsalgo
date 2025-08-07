"use client";

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import {
  getSchedulePhotos,
  type GetSchedulePhotosResult,
  type SchedulePhotoWithUploader,
} from "../actions/get-schedule-photos";

interface UseSchedulePhotosOptions {
  scheduleId: string;
  limit?: number;
  enabled?: boolean; // 쿼리 실행 여부 제어
}

interface UseSchedulePhotosReturn {
  photos: SchedulePhotoWithUploader[];
  canUpload: boolean;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => Promise<void>;
}

export const useSchedulePhotos = ({
  scheduleId,
  limit = 20,
  enabled = true,
}: UseSchedulePhotosOptions): UseSchedulePhotosReturn => {
  const queryClient = useQueryClient();

  // 기본 사진 목록 조회
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["schedulePhotos", scheduleId],
    queryFn: () => getSchedulePhotos({ scheduleId, limit, offset: 0 }),
    enabled: enabled && !!scheduleId,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지 (구 cacheTime)
  });

  // 추가 사진 로딩을 위한 쿼리 (무한 스크롤)
  const loadMore = useCallback(async () => {
    if (!data?.success || !data.hasMore) return;

    const currentOffset = data.photos.length;

    try {
      const morePhotos = await getSchedulePhotos({
        scheduleId,
        limit,
        offset: currentOffset,
      });

      if (morePhotos.success && morePhotos.photos.length > 0) {
        // 기존 캐시 데이터에 새로운 사진들을 추가
        queryClient.setQueryData(
          ["schedulePhotos", scheduleId],
          (oldData: GetSchedulePhotosResult | undefined) => {
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
  }, [data, scheduleId, limit, queryClient]);

  // 새로고침 함수
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // 반환 데이터 가공
  const photos = data?.success ? data.photos : [];
  const canUpload = data?.success ? data.canUpload : false;
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
    canUpload,
    totalCount,
    isLoading,
    error: errorMessage,
    hasMore,
    refresh,
    loadMore,
  };
};

// 사진 업로드 완료 후 캐시 무효화를 위한 헬퍼 함수
export const useInvalidateSchedulePhotos = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (scheduleId: string) => {
      queryClient.invalidateQueries({
        queryKey: ["schedulePhotos", scheduleId],
      });
    },
    [queryClient]
  );
};

export default useSchedulePhotos;
