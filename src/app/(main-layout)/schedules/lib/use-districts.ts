"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "../actions/get-access-token";
import { getDistricts } from "../actions/get-districts";

interface AccessTokenResponse {
  result: {
    accessToken: string;
    accessTimeout: string;
  };
  errCd: number;
  errMsg: string;
  id: string;
  trId: string;
}

interface District {
  cd: string;
  addr_name: string;
}

interface DistrictsResponse {
  result: District[];
  errCd: number;
  errMsg: string;
  id: string;
  trId: string;
}

/**
 * 토큰이 만료되었는지 확인하는 함수
 */
const isTokenExpired = (accessTimeout: string): boolean => {
  const timeoutMs = parseInt(accessTimeout, 10);
  const currentTime = Date.now();
  // 만료 5분 전에 갱신하도록 버퍼를 둠
  const bufferMs = 5 * 60 * 1000;
  return currentTime >= timeoutMs - bufferMs;
};

/**
 * 특정 시/도의 시군구 목록 조회 훅 (토큰 관리 포함)
 */
export function useDistricts(cityCd?: string) {
  const queryClient = useQueryClient();

  return useQuery<DistrictsResponse>({
    queryKey: ["districts", cityCd],
    queryFn: async () => {
      if (!cityCd) {
        throw new Error("시/도 코드가 필요합니다");
      }

      // 캐시된 토큰 정보 확인
      let tokenData = queryClient.getQueryData<AccessTokenResponse>([
        "accessToken",
      ]);

      // 토큰이 없거나 만료된 경우 새로 발급
      if (!tokenData || isTokenExpired(tokenData.result.accessTimeout)) {
        console.log("토큰 갱신 중...");

        // 토큰 쿼리를 무효화하고 새로 발급
        await queryClient.invalidateQueries({ queryKey: ["accessToken"] });

        const newTokenData = await queryClient.fetchQuery({
          queryKey: ["accessToken"],
          queryFn: getAccessToken,
          staleTime: 1000 * 60 * 10, // 10분
        });

        tokenData = newTokenData as AccessTokenResponse;
      }

      if (!tokenData?.result?.accessToken) {
        throw new Error("액세스 토큰을 가져올 수 없습니다");
      }

      try {
        return await getDistricts(tokenData.result.accessToken, cityCd);
      } catch (error) {
        // API 응답이 401인 경우 토큰 갱신 후 재시도
        if (error instanceof Error && error.message.includes("401")) {
          console.log("토큰 만료로 인한 재시도...");

          await queryClient.invalidateQueries({ queryKey: ["accessToken"] });

          const refreshedTokenData = (await queryClient.fetchQuery({
            queryKey: ["accessToken"],
            queryFn: getAccessToken,
            staleTime: 1000 * 60 * 10,
          })) as AccessTokenResponse;

          return await getDistricts(
            refreshedTokenData.result.accessToken,
            cityCd
          );
        }

        throw error;
      }
    },
    enabled: !!cityCd,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 15, // 15분간 캐시 유지
    retry: (failureCount, error) => {
      // 토큰 관련 오류는 1회만 재시도
      if (error instanceof Error && error.message.includes("401")) {
        return failureCount < 1;
      }
      return failureCount < 3;
    },
  });
}

/**
 * 액세스 토큰만 필요한 경우를 위한 별도 훅 (선택적)
 */
export function useAccessToken() {
  return useQuery<AccessTokenResponse>({
    queryKey: ["accessToken"],
    queryFn: getAccessToken,
    staleTime: 1000 * 60 * 10, // 10분
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
    refetchOnWindowFocus: false,
  });
}
