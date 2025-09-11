// shared/hooks/use-districts.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccessToken } from "./use-access-token";
import { getDistricts } from "../actions/get-districts";

/**
 * 특정 시/도의 시군구 목록 조회 훅
 */
export function useDistricts(cityCd?: string) {
  const { token, refresh } = useAccessToken();
  console.log(token, "token");
  console.log(cityCd, "cityCd");

  return useQuery({
    queryKey: ["districts", cityCd, token],
    queryFn: async () => {
      if (!token) throw new Error("토큰 없음");
      if (!cityCd) throw new Error("시/도 코드 없음");
      try {
        return await getDistricts(token, cityCd);
      } catch (error) {
        // 토큰 만료 시 재발급 후 재시도
        if (error === "Unauthorized") {
          const { data: newToken } = await refresh();
          if (!newToken) throw new Error("토큰 재발급 실패");
          return await getDistricts(cityCd, newToken);
        }
        throw error;
      }
    },
    enabled: !!cityCd, // cityCd 있을 때만 실행
  });
}
