// shared/hooks/use-access-token.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "../actions/get-access-token";

/**
 * access token을 캐싱해서 제공하는 훅
 */
export function useAccessToken() {
  const query = useQuery({
    queryKey: ["accessToken"],
    queryFn: getAccessToken,
    staleTime: 1000 * 60 * 10, // 10분 캐싱
  });
  console.log(query.data, "query.data");
  const token = query.data?.result.accessToken;

  return { token, refresh: query.refetch };
}
