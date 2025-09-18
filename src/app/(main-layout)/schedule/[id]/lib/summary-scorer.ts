// 골 득점자 정보를 집계하고 표시하는 유틸리티 함수
interface GoalRecord {
  id: string;
  scorerSide: "HOME" | "AWAY" | "UNDECIDED";
  scorerId: string | null;
  isOwnGoal: boolean;
  isScoredByMercenary: boolean;
  scorer: {
    id: string;
    nickname: string | null;
  } | null;
}

interface Match {
  id: string;
  homeScore: number;
  awayScore: number;
  goals: GoalRecord[];
}

/**
 * 골 득점자들을 집계하여 "닉네임 n골" 형식으로 반환
 */
export function formatGoalScorers(match: Match): string {
  const { homeScore, awayScore, goals } = match;

  // 무승부인 경우
  if (homeScore === 0 && awayScore === 0) {
    return "무승부";
  }

  // 득점자별 골 수 집계
  const scorerCounts = new Map<string, number>();

  goals.forEach((goal) => {
    if (goal.isOwnGoal) {
      // 자책골은 집계하지 않음
      return;
    }

    let scorerName: string;

    if (goal.isScoredByMercenary) {
      scorerName = "용병";
    } else if (goal.scorer?.nickname) {
      scorerName = goal.scorer.nickname;
    } else {
      // scorer 정보가 없는 경우 건너뛰기
      return;
    }

    scorerCounts.set(scorerName, (scorerCounts.get(scorerName) || 0) + 1);
  });

  // 득점 수 내림차순으로 정렬하여 문자열 생성
  const scorerTexts = Array.from(scorerCounts.entries())
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([name, count]) => `${name} ${count}골`);

  return scorerTexts.length > 0 ? scorerTexts.join(", ") : "득점 기록 없음";
}

/**
 * 간단한 득점자 표시 (최고 득점자만)
 */
export function formatTopScorer(match: Match): string {
  const { homeScore, awayScore, goals } = match;

  if (homeScore === 0 && awayScore === 0) {
    return "무승부";
  }

  const scorerCounts = new Map<string, number>();

  goals.forEach((goal) => {
    if (goal.isOwnGoal) return;

    const scorerName = goal.isScoredByMercenary
      ? "용병"
      : goal.scorer?.nickname || "미상";

    scorerCounts.set(scorerName, (scorerCounts.get(scorerName) || 0) + 1);
  });

  if (scorerCounts.size === 0) return "";

  const topScorer = Array.from(scorerCounts.entries()).sort(
    ([, countA], [, countB]) => countB - countA
  )[0];

  return topScorer[1] > 1 ? `${topScorer[0]} ${topScorer[1]}골` : topScorer[0];
}
