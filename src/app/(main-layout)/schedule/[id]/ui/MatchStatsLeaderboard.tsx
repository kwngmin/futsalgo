"use client";

import React, { useMemo, useState } from "react";
import { UserCircle, ChevronDown, ChevronUp } from "lucide-react";
import { ChartBarIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  isMember?: boolean;
}

// 순위 배지 스타일 헬퍼 함수
const getRankBadgeStyle = (rank: PlayerStats["rank"]) => {
  const styles = {
    gold: "bg-gradient-to-br from-yellow-300 to-yellow-500 text-gray-800",
    silver: "bg-gradient-to-br from-gray-200/80 to-gray-300 text-gray-800",
    bronze: "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
  };
  return styles[rank as keyof typeof styles] || "bg-gray-100 text-gray-700";
};

// 통계 업데이트 헬퍼 함수
const updatePlayerStat = (
  statsMap: Map<string, PlayerStats>,
  userId: string,
  user: User,
  type: "goals" | "assists"
) => {
  const existing = statsMap.get(userId) || {
    user,
    goals: 0,
    assists: 0,
    total: 0,
  };
  existing[type] += 1;
  existing.total += 1;
  statsMap.set(userId, existing);
};

// 프로필 이미지 컴포넌트
const ProfileImage: React.FC<{ user: User }> = ({ user }) => {
  const [imageError, setImageError] = useState(false);

  if (!user.image || imageError) {
    return (
      <div className="size-12 rounded-full bg-gray-200 flex items-center justify-center">
        <UserCircle className="size-8 text-gray-400" />
      </div>
    );
  }

  return (
    <Image
      src={user.image}
      alt={user.nickname || user.name || ""}
      className="size-12 rounded-full object-cover border border-gray-200"
      onError={() => setImageError(true)}
      width={64}
      height={64}
    />
  );
};

// 통계 표시 컴포넌트
const StatDisplay: React.FC<{
  value: number;
  isTotal?: boolean;
  rank?: PlayerStats["rank"];
}> = ({ value, isTotal = false, rank }) => (
  <div
    className={`size-9 flex justify-center items-center ${
      isTotal
        ? `rounded-full font-medium ${getRankBadgeStyle(rank)}`
        : "text-gray-700"
    }`}
  >
    {value}
  </div>
);

const MatchStatsLeaderboard: React.FC<MatchStatsLeaderboardProps> = ({
  schedule,
  isMember = false,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // 통계 계산 및 순위 부여
  const playerStats = useMemo(() => {
    const statsMap = new Map<string, PlayerStats>();

    // 모든 매치의 골 기록 처리
    schedule.matches.forEach((match) => {
      match.goals.forEach((goalRecord) => {
        // 자책골은 제외
        if (goalRecord.isOwnGoal) return;

        // 득점자 처리
        if (goalRecord.scorerId && goalRecord.scorer) {
          updatePlayerStat(
            statsMap,
            goalRecord.scorerId,
            goalRecord.scorer,
            "goals"
          );
        }

        // 어시스트 처리
        if (goalRecord.assistId && goalRecord.assist) {
          updatePlayerStat(
            statsMap,
            goalRecord.assistId,
            goalRecord.assist,
            "assists"
          );
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

    // 순위 부여
    if (sortedStats.length > 0) {
      // 고유한 점수들 찾기 (상위 3개만)
      const uniqueScores = Array.from(new Set(sortedStats.map((s) => s.total)))
        .sort((a, b) => b - a)
        .slice(0, 3);

      sortedStats.forEach((stat) => {
        const scoreIndex = uniqueScores.indexOf(stat.total);
        const ranks: PlayerStats["rank"][] = ["gold", "silver", "bronze"];
        stat.rank =
          scoreIndex >= 0 && scoreIndex < 3 ? ranks[scoreIndex] : null;
      });
    }

    return sortedStats;
  }, [schedule.matches]);

  if (playerStats.length === 0) {
    return null;
  }

  const displayedStats = isExpanded ? playerStats : playerStats.slice(0, 3);
  const hasMoreItems = playerStats.length > 3;

  return (
    <div className="px-4 select-none">
      {/* 헤더 */}
      <div className="flex justify-between items-center py-2 min-h-13 border-b border-slate-200 mb-2">
        <div className="flex items-center gap-2">
          <ChartBarIcon weight="fill" className="size-7 text-zinc-500" />
          <h2 className="text-xl font-semibold">통계</h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-10 text-sm text-slate-500 px-2 sm:px-4">
          {["득점", "도움", "합계"].map((label) => (
            <span key={label} className="w-9 text-center font-medium">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* 통계 리스트 */}
      <div className="divide-y divide-gray-100">
        {displayedStats.map((stat) => (
          <div
            key={stat.user.id}
            className="sm:rounded-md flex items-center justify-between py-1 transition-colors"
          >
            {/* 프로필 정보 */}
            <div className="flex items-center gap-3">
              <ProfileImage user={stat.user} />
              <div className="flex flex-col items-start">
                <button
                  type="button"
                  onClick={() => router.push(`/players/${stat.user.id}`)}
                  className="font-medium text-gray-900 hover:underline underline-offset-4 cursor-pointer hover:font-semibold leading-tight"
                >
                  {stat.user.nickname || stat.user.name || "선수"}
                </button>
                {isMember && stat.user.name && stat.user.nickname && (
                  <span className="text-sm text-gray-500">
                    {stat.user.name}
                  </span>
                )}
              </div>
            </div>

            {/* 통계 정보 */}
            <div className="flex items-center gap-3 sm:gap-10 px-2 sm:px-4">
              <StatDisplay value={stat.goals} />
              <StatDisplay value={stat.assists} />
              <StatDisplay value={stat.total} isTotal rank={stat.rank} />
            </div>
          </div>
        ))}
      </div>

      {/* 더보기/접기 버튼 */}
      {hasMoreItems && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 w-full flex items-center justify-center gap-1 px-4 h-12 sm:h-11 sm:text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors cursor-pointer active:scale-98"
        >
          {isExpanded ? "접기" : "더보기"}
          {isExpanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
      )}
    </div>
  );
};

export default MatchStatsLeaderboard;
