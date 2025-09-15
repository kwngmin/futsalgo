"use client";

import { cn } from "@/shared/lib/utils";
import { TeamLevel } from "@prisma/client";
import { useMemo, useCallback, useState } from "react";

export interface TeamLevelFilter {
  [TeamLevel.VERY_LOW]: boolean;
  [TeamLevel.LOW]: boolean;
  [TeamLevel.MID]: boolean;
  [TeamLevel.HIGH]: boolean;
  [TeamLevel.VERY_HIGH]: boolean;
  label: string;
}

interface FilterTeamLevelProps {
  onClose: () => void;
  setFilterValues: (values: { teamLevel?: TeamLevelFilter }) => void;
}

// 상수를 컴포넌트 외부로 이동하여 재렌더링 시 재생성 방지
const TEAM_LEVEL_LABELS: Record<TeamLevel, string> = {
  [TeamLevel.VERY_LOW]: "하",
  [TeamLevel.LOW]: "중하",
  [TeamLevel.MID]: "중",
  [TeamLevel.HIGH]: "중상",
  [TeamLevel.VERY_HIGH]: "상",
};

const TEAM_LEVEL_ORDER: TeamLevel[] = [
  TeamLevel.VERY_LOW,
  TeamLevel.LOW,
  TeamLevel.MID,
  TeamLevel.HIGH,
  TeamLevel.VERY_HIGH,
];

// 초기 필터 상태를 생성하는 헬퍼 함수
const createInitialTeamLevelFilter = (): Omit<TeamLevelFilter, "label"> => ({
  [TeamLevel.VERY_LOW]: false,
  [TeamLevel.LOW]: false,
  [TeamLevel.MID]: false,
  [TeamLevel.HIGH]: false,
  [TeamLevel.VERY_HIGH]: false,
});

const FilterTeamLevel = ({
  onClose,
  setFilterValues,
}: FilterTeamLevelProps) => {
  const [level, setLevel] = useState<TeamLevelFilter | undefined>(undefined);

  // 라벨 생성 로직 개선 및 메모이제이션
  const generateLabel = useCallback(
    (teamLevels: Omit<TeamLevelFilter, "label">): string => {
      // DayKey만 필터링하여 label 속성 제외
      const selectedDays = TEAM_LEVEL_ORDER.filter(
        (teamLevel) => teamLevels[teamLevel]
      );

      if (selectedDays.length === 0) return "";

      const selectedLabels = selectedDays.map(
        (teamLevel) => TEAM_LEVEL_LABELS[teamLevel]
      );

      if (selectedLabels.length === 1) {
        return selectedLabels[0];
      }

      return selectedLabels.join(", ");
    },
    []
  );

  // 현재 선택된 요일들을 메모이제이션
  const currentDays = useMemo(
    () => level || createInitialTeamLevelFilter(),
    [level]
  );

  const handlePeriodToggle = useCallback(
    (teamLevel: TeamLevel) => {
      const newPeriods = {
        ...currentDays,
        [teamLevel]: !currentDays[teamLevel],
      };

      // 선택된 시간대 개수 확인
      const selectedCount = TEAM_LEVEL_ORDER.filter(
        (t) => newPeriods[t]
      ).length;

      // 모든 시간대가 선택되었거나, 아무것도 선택되지 않았으면 undefined로 설정
      if (selectedCount === 0 || selectedCount === TEAM_LEVEL_ORDER.length) {
        setLevel(undefined);
        return;
      }

      const label = generateLabel(newPeriods);

      setLevel({
        ...newPeriods,
        label,
      });
    },
    [currentDays, generateLabel]
  );

  const handleSelectAll = useCallback(() => {
    setLevel(undefined);
  }, []);

  // 버튼 클래스 생성 함수 메모이제이션
  const getPeriodButtonClass = useCallback((isSelected: boolean) => {
    return cn(
      "shrink-0 cursor-pointer w-20 sm:w-16 h-11 sm:h-10 md:h-9 flex items-center justify-center rounded-sm sm:text-sm border transition-colors",
      isSelected
        ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
        : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
    );
  }, []);

  // 전체 버튼 클래스 메모이제이션
  const allButtonClass = useMemo(
    () =>
      cn(
        "cursor-pointer w-20 sm:w-24 h-11 sm:h-10 md:h-9 flex items-center justify-center rounded-sm sm:text-sm border transition-colors shrink-0",
        level === undefined
          ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
          : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
      ),
    [level]
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (level !== undefined) {
        setFilterValues({ teamLevel: level });
      }
      onClose();
    },
    [onClose, level, setFilterValues]
  );

  return (
    <div className="flex items-center gap-2 mx-4 mt-2 pr-2 bg-gray-100 rounded-md py-1">
      <div className="grow h-11 sm:h-10 md:h-9 flex items-start overflow-hidden border-r border-gray-300 sm:border-none">
        <div className="pl-1 pr-2 w-full overflow-y-hidden flex gap-1 overflow-x-scroll shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectAll();
            }}
            className={allButtonClass}
          >
            전체
          </button>

          {TEAM_LEVEL_ORDER.map((teamLevel) => (
            <button
              key={teamLevel}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePeriodToggle(teamLevel);
              }}
              className={getPeriodButtonClass(level?.[teamLevel] || false)}
            >
              {TEAM_LEVEL_LABELS[teamLevel]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className={`cursor-pointer font-semibold w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm shrink-0 ${
          level === undefined
            ? "bg-gray-300/80 hover:bg-gray-300 text-gray-700"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {level === undefined ? "닫기" : "저장"}
      </button>
    </div>
  );
};

export default FilterTeamLevel;
