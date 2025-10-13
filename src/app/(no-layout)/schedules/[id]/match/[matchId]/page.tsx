"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getMatchData } from "./actions/get-match-data";
import MatchContent from "./ui/MatchContent";
import { MatchDataResult } from "./model/types";

const MatchPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const matchId = params.matchId as string;

  const {
    data: matchData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["matchData", matchId, id],
    queryFn: () => getMatchData(matchId, id),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60, // 1분 동안 fresh 상태 유지
    gcTime: 1000 * 60 * 5, // 5분 동안 캐시 유지
    retry: 3,
  });

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pb-16">
        <div className="flex items-center justify-between px-4 h-16 shrink-0">
          <div className="flex gap-2 items-center">
            <div className="h-8 w-20 bg-neutral-200 animate-pulse rounded" />
            <div className="size-10 bg-neutral-100 animate-pulse rounded-full" />
            <div className="size-10 bg-neutral-100 animate-pulse rounded-full" />
          </div>
          <div className="size-10 bg-neutral-100 animate-pulse rounded-full" />
        </div>

        {/* 팀 정보 스켈레톤 */}
        <div className="relative grid grid-cols-2 p-4 sm:pb-6 gap-8 bg-gradient-to-b from-slate-100 to-white sm:to-slate-50 sm:mx-4 sm:rounded-md">
          <div className="grow flex flex-col items-center gap-2 min-w-28 group select-none">
            <div className="h-6 w-12 bg-neutral-200/80 animate-pulse rounded" />
            <div className="size-16 rounded-full bg-gray-200 flex items-center justify-center animate-pulse" />
            <div className="w-28 h-6 bg-neutral-200/80 animate-pulse rounded" />
          </div>
          <div className="grow flex flex-col items-center gap-2 min-w-28 group select-none">
            <div className="h-6 w-12 bg-neutral-200/80 animate-pulse rounded" />
            <div className="size-16 rounded-full bg-gray-200 flex items-center justify-center animate-pulse" />
            <div className="w-28 h-6 bg-neutral-200/80 animate-pulse rounded" />
          </div>
        </div>

        {/* 라인업 스켈레톤 */}
        <div className="px-4 space-y-3 mt-4">
          <div className="h-12 w-32 bg-neutral-100 animate-pulse rounded" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-14 bg-neutral-50 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    console.error("매치 데이터 로딩 실패:", error);
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          데이터를 불러올 수 없습니다
        </h2>
        <p className="text-muted-foreground mb-4">잠시 후 다시 시도해주세요</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          새로고침
        </button>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!matchData) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <h2 className="text-lg font-semibold mb-2">매치를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-4">
          매치가 삭제되었거나 존재하지 않습니다
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return <MatchContent data={matchData as MatchDataResult} />;
};

export default MatchPage;
