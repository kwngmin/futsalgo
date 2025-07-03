import { getMatches } from "@/app/(main-layout)/matches/actions/get-matches";
import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

/**
 * 경기 목록을 불러오는 커스텀 훅
 *
 * @returns 경기 데이터, 로딩 상태, 에러 객체
 */
export function useMatchesQuery() {
  const session = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
    placeholderData: keepPreviousData,
    enabled: !!session.data?.user?.id,
  });

  return { data, isLoading, error };
}
