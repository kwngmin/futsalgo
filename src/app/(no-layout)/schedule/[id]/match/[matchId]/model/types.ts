import type {
  TeamSide,
  MatchType,
  ScheduleStatus,
  Position,
} from "@prisma/client";

export interface MatchDataUser {
  id: string;
  nickname: string | null;
  image: string | null;
  position: Position | null;
  name?: string; // 멤버인 경우에만 포함
}

export interface MatchDataLineup {
  id: string;
  matchId: string;
  userId: string;
  side: TeamSide;
  user: MatchDataUser;
}

export interface MatchDataTeam {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface MatchDataSchedule {
  id: string;
  place: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  description: string | null;
  matchType: MatchType;
}

export interface MatchDataMatch {
  id: string;
  scheduleId: string;
  durationMinutes: number | null;
  homeScore: number;
  awayScore: number;
  createdById: string;
  homeTeamId: string;
  awayTeamId: string;
  undecidedTeamMercenaryCount: number;
  awayTeamMercenaryCount: number;
  homeTeamMercenaryCount: number;
  createdAt: Date;
  updatedAt: Date;
  schedule: MatchDataSchedule;
  homeTeam: MatchDataTeam;
  awayTeam: MatchDataTeam;
}

export interface MatchDataGoalUser {
  id: string;
  nickname: string | null;
  name?: string; // 멤버인 경우에만 포함
}

export interface MatchDataGoal {
  id: string;
  matchId: string;
  scorerSide: TeamSide;
  scorerId: string | null;
  assistId: string | null;
  isOwnGoal: boolean;
  isScoredByMercenary: boolean;
  isAssistedByMercenary: boolean;
  createdAt: Date;
  scorer: MatchDataGoalUser | null;
  assist: MatchDataGoalUser | null;
}

export interface MatchDataSimpleMatch {
  id: string;
  homeScore: number;
  awayScore: number;
  createdAt: Date;
}

export interface MatchDataPermissions {
  isMember: boolean;
  isEditable: boolean;
}

export interface MatchDataResult {
  match: MatchDataMatch;
  lineups: MatchDataLineup[];
  allMatches: MatchDataSimpleMatch[];
  goals: MatchDataGoal[];
  matchOrder: number;
  permissions: MatchDataPermissions;
}

// 골과 점수를 함께 가지는 타입
export interface GoalWithScore extends MatchDataGoal {
  scoreAtTime: string;
}
