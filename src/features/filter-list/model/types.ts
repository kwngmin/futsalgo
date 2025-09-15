import {
  DayOfWeek,
  Gender,
  MatchType,
  Period,
  PlayerBackground,
  PlayerSkillLevel,
  RecruitmentStatus,
  TeamGender,
  TeamLevel,
} from "@prisma/client";

export interface FilterOption {
  icon?: React.ElementType;
  label: string;
  value: string;
}

// 필터 타입 정의
export interface ScheduleFilters {
  searchQuery?: string;
  matchType?: MatchType;
  days?: DayOfWeek[];
  startPeriod?: Period[];
  city?: string;
  district?: string;
}

export interface TeamFilters {
  searchQuery?: string;
  gender?: TeamGender;
  city?: string;
  district?: string;
  recruitment?: RecruitmentStatus;
  teamMatchAvailable?: boolean;
  teamLevel?: TeamLevel[];
}

export interface PlayerFilters {
  searchQuery?: string;
  gender?: Gender;
  background?: PlayerBackground;
  lowerAge?: number;
  higherAge?: number;
  skillLevel?: PlayerSkillLevel[];
}
