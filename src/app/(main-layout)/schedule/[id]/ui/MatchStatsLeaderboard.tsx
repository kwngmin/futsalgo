"use client";

import React, { useMemo, useState } from "react";
import { UserCircle, ChevronDown, ChevronUp } from "lucide-react";
import { ChartBarIcon } from "@phosphor-icons/react";
import Image from "next/image";

// 타입 정의
interface User {
  id: string;
  name?: string | null;
  nickname?: string | null;
  image?: string | null;
}

interface GoalRecord {
  id: string;
  scorerId?: string | null;
  assistId?: string | null;
  isOwnGoal: boolean;
  scorer?: User | null;
  assist?: User | null;
}

interface Match {
  id: string;
  goals: GoalRecord[];
}

interface Schedule {
  id: string;
  hostTeamId: string;
  invitedTeamId?: string | null;
  matches: Match[];
}

interface PlayerStats {
  user: User;
  goals: number;
  assists: number;
  total: number;
  rank?: "gold" | "silver" | "bronze" | null;
}

interface MatchStatsLeaderboardProps {
  schedule: Schedule;
  isMember?: boolean; // 현재 사용자가 참가 팀 멤버인지 여부
}

const MatchStatsLeaderboard: React.FC<MatchStatsLeaderboardProps> = ({
  schedule,
  isMember = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 통계 계산 및 순위 부여
  const playerStats = useMemo(() => {
    const statsMap = new Map<string, PlayerStats>();

    // 모든 매치의 골 기록 순회
    schedule.matches.forEach((match) => {
      match.goals.forEach((goalRecord) => {
        // 자책골은 제외
        if (goalRecord.isOwnGoal) return;

        // 득점자 처리
        if (goalRecord.scorerId && goalRecord.scorer) {
          const existing = statsMap.get(goalRecord.scorerId) || {
            user: goalRecord.scorer,
            goals: 0,
            assists: 0,
            total: 0,
          };
          existing.goals += 1;
          existing.total += 1;
          statsMap.set(goalRecord.scorerId, existing);
        }

        // 어시스트 처리
        if (goalRecord.assistId && goalRecord.assist) {
          const existing = statsMap.get(goalRecord.assistId) || {
            user: goalRecord.assist,
            goals: 0,
            assists: 0,
            total: 0,
          };
          existing.assists += 1;
          existing.total += 1;
          statsMap.set(goalRecord.assistId, existing);
        }
      });
    });

    // 배열로 변환하고 정렬
    const sortedStats = Array.from(statsMap.values()).sort((a, b) => {
      // 1. 합계 내림차순
      if (b.total !== a.total) return b.total - a.total;
      // 2. 득점 내림차순
      if (b.goals !== a.goals) return b.goals - a.goals;
      // 3. 같으면 닉네임 또는 이름으로 정렬
      const aName = a.user.nickname || a.user.name || "";
      const bName = b.user.nickname || b.user.name || "";
      return aName.localeCompare(bName);
    });

    // 동점자를 고려한 순위 부여
    if (sortedStats.length > 0) {
      // 고유한 점수들 찾기 (상위 3개만)
      const uniqueScores = Array.from(new Set(sortedStats.map((s) => s.total)))
        .sort((a, b) => b - a)
        .slice(0, 3);

      sortedStats.forEach((stat) => {
        const scoreIndex = uniqueScores.indexOf(stat.total);
        if (scoreIndex === 0) {
          stat.rank = "gold";
        } else if (scoreIndex === 1) {
          stat.rank = "silver";
        } else if (scoreIndex === 2) {
          stat.rank = "bronze";
        } else {
          stat.rank = null;
        }
      });
    }

    return sortedStats;
  }, [schedule.matches]);

  // 표시할 데이터 결정
  const displayedStats = isExpanded ? playerStats : playerStats.slice(0, 3);
  const hasMoreItems = playerStats.length > 3;

  if (playerStats.length === 0) {
    return null;
  }

  const getRankBadgeStyle = (rank: PlayerStats["rank"]) => {
    switch (rank) {
      case "gold":
        return "bg-gradient-to-br from-yellow-400/80 to-yellow-500 text-gray-800";
      case "silver":
        return "bg-gradient-to-br from-gray-200/80 to-gray-300 text-gray-800";
      case "bronze":
        return "bg-gradient-to-br from-amber-600/80 to-amber-700 text-white";
      default:
        return "text-gray-700";
      // return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="px-4 select-none">
      {/* 경기 타이틀 바 */}
      <div className="flex justify-between items-center py-2 min-h-13 border-b border-slate-200 mb-2">
        <div className="flex items-center gap-2">
          <ChartBarIcon weight="fill" className="size-7 text-zinc-500" />
          <h2 className="text-lg font-semibold">통계</h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-10 text-sm text-slate-500 px-2 sm:px-4">
          <span className="w-9 text-center font-medium">득점</span>
          <span className="w-9 text-center font-medium">도움</span>
          <span className="w-9 text-center font-medium">합계</span>
        </div>
      </div>

      {/* 경기 통계 내용 */}
      <div
      //   className="rounded-md border border-gray-200 overflow-hidden shadow-xs group"
      >
        <div className="divide-y divide-gray-100">
          {displayedStats.map((stat) => {
            // 실제 순위 계산 (동점자 고려)
            // const actualRank =
            //   playerStats.filter((s) => s.total > stat.total).length + 1;

            return (
              <div
                key={stat.user.id}
                className="sm:rounded-md flex items-center justify-between py-2 transition-colors"
              >
                {/* 왼쪽: 프로필 정보 */}
                <div className="flex items-center gap-2">
                  {/* 순위 표시 */}
                  {/* <div className="hidden sm:block text-gray-400 text-sm text-center w-4 sm:w-6">
                    {index + 1}
                    {actualRank}
                  </div> */}

                  {/* 프로필 이미지 */}
                  <div className="relative">
                    {stat.user.image ? (
                      <Image
                        src={stat.user.image}
                        alt={stat.user.nickname || stat.user.name || ""}
                        className="size-12 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = "";
                          target.style.display = "none";
                          const sibling = target.nextElementSibling;
                          if (sibling) {
                            sibling.classList.remove("hidden");
                          }
                        }}
                        width={64}
                        height={64}
                      />
                    ) : null}
                    <div
                      className={`w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center ${
                        stat.user.image ? "hidden" : ""
                      }`}
                    >
                      <UserCircle className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>

                  {/* 이름 정보 */}
                  <div className="flex flex-col *:leading-tight">
                    <span className="font-medium text-gray-900">
                      {stat.user.nickname || stat.user.name || "선수"}
                    </span>
                    {/* 실명은 멤버일 때만 표시 */}
                    {isMember && stat.user.name && stat.user.nickname && (
                      <span className="text-sm text-gray-500">
                        {stat.user.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* 오른쪽: 통계 정보 */}
                <div className="flex items-center gap-3 sm:gap-10 px-2 sm:px-4">
                  <div className="size-9 flex justify-center items-center text-gray-700">
                    {stat.goals}
                  </div>
                  <div className="size-9 flex justify-center items-center text-gray-700">
                    {stat.assists}
                  </div>
                  <div
                    className={`size-9 rounded-full flex justify-center items-center font-medium ${getRankBadgeStyle(
                      stat.rank
                    )}`}
                  >
                    {stat.total}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 더보기/접기 버튼 */}
        {hasMoreItems && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 w-full flex items-center justify-center gap-1 px-4 h-12 sm:h-11 sm:text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                접기
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                더보기
                <ChevronDown className="w-4 h-4" />
                {/* 더보기 ({playerStats.length - 3}명 더)
                <ChevronDown className="w-4 h-4" /> */}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchStatsLeaderboard;
