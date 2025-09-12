import { DayOfWeek, MatchType, Period } from "@prisma/client";

// 필터 타입 정의
export interface ScheduleFilters {
  searchQuery?: string;
  matchType?: MatchType;
  days?: DayOfWeek[];
  startPeriod?: Period[];
  city?: string;
  district?: string;
}
