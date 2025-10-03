// Match 타입 정의 (Prisma 스키마 기반)
type Match = {
  id: string;
  homeTeamMercenaryCount: number;
  awayTeamMercenaryCount: number;
  lineups: Lineup[];
};

type Lineup = {
  id: string;
  matchId: string;
  userId: string;
  side: "HOME" | "AWAY" | "UNDECIDED";
};

/**
 * 매치 데이터를 기반으로 팀별 인원수를 "4vs4" 형태의 문자열로 반환합니다.
 * @param match - 라인업 정보가 포함된 매치 데이터
 * @returns "홈팀인원vs어웨이팀인원" 형태의 문자열 (예: "4vs5")
 */
export const getMatchLineupCount = (match: Match): string => {
  // HOME 팀 인원 계산: 라인업에서 side가 'HOME'인 선수 수 + 용병 수
  const homePlayerCount = match.lineups.filter(
    (lineup) => lineup.side === "HOME"
  ).length;
  const homeTotalCount = homePlayerCount + match.homeTeamMercenaryCount;

  // AWAY 팀 인원 계산: 라인업에서 side가 'AWAY'인 선수 수 + 용병 수
  const awayPlayerCount = match.lineups.filter(
    (lineup) => lineup.side === "AWAY"
  ).length;
  const awayTotalCount = awayPlayerCount + match.awayTeamMercenaryCount;

  if (homeTotalCount === 0 || awayTotalCount === 0) {
    return "출전 명단 없음";
  }

  return `${homeTotalCount} vs ${awayTotalCount}`;
};
