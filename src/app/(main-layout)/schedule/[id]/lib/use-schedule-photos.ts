"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSchedulePhotos,
  type GetSchedulePhotosResult,
  type SchedulePhotoWithUploader,
} from "../actions/get-schedule-photos";

interface UseSchedulePhotosOptions {
  scheduleId: string;
  limit?: number;
  autoRefresh?: boolean; // 자동 새로고침 여부
  refreshInterval?: number; // 새로고침 간격 (ms)
}

interface UseSchedulePhotosReturn {
  photos: SchedulePhotoWithUploader[];
  canUpload: boolean;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export const useSchedulePhotos = ({
  scheduleId,
  limit = 20,
  autoRefresh = false,
  refreshInterval = 30000, // 30초
}: UseSchedulePhotosOptions): UseSchedulePhotosReturn => {
  const [photos, setPhotos] = useState<SchedulePhotoWithUploader[]>([]);
  const [canUpload, setCanUpload] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 사진 목록 조회 함수
  const fetchPhotos = useCallback(
    async (currentOffset: number = 0, append: boolean = false) => {
      if (!scheduleId) return;

      setIsLoading(true);
      setError(null);

      try {
        const result: GetSchedulePhotosResult = await getSchedulePhotos({
          scheduleId,
          limit,
          offset: currentOffset,
        });

        if (result.success) {
          if (append) {
            setPhotos((prev) => [...prev, ...result.photos]);
          } else {
            setPhotos(result.photos);
          }

          setCanUpload(result.canUpload);
          setTotalCount(result.totalCount);
          setHasMore(currentOffset + result.photos.length < result.totalCount);
        } else {
          setError(result.message || "사진을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("Failed to fetch schedule photos:", err);
        setError("사진을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [scheduleId, limit]
  );

  // 새로고침
  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchPhotos(0, false);
  }, [fetchPhotos]);

  // 더 불러오기
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    const newOffset = offset + limit;
    setOffset(newOffset);
    await fetchPhotos(newOffset, true);
  }, [fetchPhotos, hasMore, isLoading, offset, limit]);

  // 초기화
  const reset = useCallback(() => {
    setPhotos([]);
    setCanUpload(false);
    setTotalCount(0);
    setOffset(0);
    setHasMore(true);
    setError(null);
  }, []);

  // 초기 로딩
  useEffect(() => {
    if (scheduleId) {
      fetchPhotos(0, false);
    }
  }, [scheduleId, fetchPhotos]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (!autoRefresh || !scheduleId) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, scheduleId, refresh]);

  return {
    photos,
    canUpload,
    totalCount,
    isLoading,
    error,
    hasMore,
    refresh,
    loadMore,
    reset,
  };
};

export default useSchedulePhotos;
