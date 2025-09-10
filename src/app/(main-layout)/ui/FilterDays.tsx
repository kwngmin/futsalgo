"use client";

import { cn } from "@/shared/lib/utils";
import { DayOfWeek } from "@prisma/client";
import { useMemo, useCallback, useState } from "react";

export interface DaysFilter {
  [DayOfWeek.MONDAY]: boolean;
  [DayOfWeek.TUESDAY]: boolean;
  [DayOfWeek.WEDNESDAY]: boolean;
  [DayOfWeek.THURSDAY]: boolean;
  [DayOfWeek.FRIDAY]: boolean;
  [DayOfWeek.SATURDAY]: boolean;
  [DayOfWeek.SUNDAY]: boolean;
  label: string;
}

interface FilterDaysProps {
  onClose: () => void;
  setFilterValues: (values: { days?: DaysFilter }) => void;
}

// 상수를 컴포넌트 외부로 이동하여 재렌더링 시 재생성 방지
const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: "월",
  [DayOfWeek.TUESDAY]: "화",
  [DayOfWeek.WEDNESDAY]: "수",
  [DayOfWeek.THURSDAY]: "목",
  [DayOfWeek.FRIDAY]: "금",
  [DayOfWeek.SATURDAY]: "토",
  [DayOfWeek.SUNDAY]: "일",
};

const DAYS_ORDER: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];
const WEEKDAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];
const WEEKEND_DAYS: DayOfWeek[] = [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY];

// 초기 필터 상태를 생성하는 헬퍼 함수
const createInitialDaysFilter = (): Omit<DaysFilter, "label"> => ({
  [DayOfWeek.MONDAY]: false,
  [DayOfWeek.TUESDAY]: false,
  [DayOfWeek.WEDNESDAY]: false,
  [DayOfWeek.THURSDAY]: false,
  [DayOfWeek.FRIDAY]: false,
  [DayOfWeek.SATURDAY]: false,
  [DayOfWeek.SUNDAY]: false,
});

// 모든 요일이 선택되었는지 확인하는 헬퍼 함수
const areAllDaysSelected = (days: Omit<DaysFilter, "label">): boolean => {
  return DAYS_ORDER.every((day) => days[day]);
};

const FilterDays = ({ onClose, setFilterValues }: FilterDaysProps) => {
  const [days, setDays] = useState<DaysFilter | undefined>(undefined);

  // 라벨 생성 로직 개선 및 메모이제이션
  const generateLabel = useCallback(
    (days: Omit<DaysFilter, "label">): string => {
      // DayKey만 필터링하여 label 속성 제외
      const selectedDays = DAYS_ORDER.filter((day) => days[day]);

      if (selectedDays.length === 0) return "";

      // 평일 체크 (월~금)
      const isWeekdays =
        WEEKDAYS.every((day) => days[day]) &&
        WEEKEND_DAYS.every((day) => !days[day]);

      // 주말 체크 (토, 일)
      const isWeekend =
        WEEKEND_DAYS.every((day) => days[day]) &&
        WEEKDAYS.every((day) => !days[day]);

      if (isWeekdays) return "평일";
      if (isWeekend) return "주말";

      const selectedLabels = selectedDays.map((day) => DAY_LABELS[day]);

      if (selectedLabels.length === 1) {
        return selectedLabels[0] + "요일";
      }

      return selectedLabels.join(", ");
    },
    []
  );

  // 현재 선택된 요일들을 메모이제이션
  const currentDays = useMemo(() => days || createInitialDaysFilter(), [days]);

  const handleDayToggle = useCallback(
    (day: DayOfWeek) => {
      const newDays = {
        ...currentDays,
        [day]: !currentDays[day],
      };

      // 모든 요일이 선택되었으면 undefined로 설정 (전체 선택과 동일하게 처리)
      if (areAllDaysSelected(newDays)) {
        setDays(undefined);
        return;
      }

      const label = generateLabel(newDays);

      setDays({
        ...newDays,
        label,
      });
    },
    [currentDays, generateLabel]
  );

  const handleSelectAll = useCallback(() => {
    setDays(undefined);
  }, []);

  // 버튼 클래스 생성 함수 메모이제이션
  const getDayButtonClass = useCallback((isSelected: boolean) => {
    return cn(
      "shrink-0 cursor-pointer w-14 h-9 sm:h-8 flex items-center justify-center rounded-sm sm:text-sm border transition-colors",
      isSelected
        ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
        : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
    );
  }, []);

  // 전체 버튼 클래스 메모이제이션
  const allButtonClass = useMemo(
    () =>
      cn(
        "cursor-pointer w-16 sm:w-24 h-9 sm:h-8 flex items-center justify-center rounded-sm sm:text-sm border transition-colors shrink-0",
        days === undefined
          ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
          : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
      ),
    [days]
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (days !== undefined) {
        setFilterValues({ days });
      }
      onClose();
    },
    [onClose, days, setFilterValues]
  );

  return (
    <div className="flex items-center gap-2 mx-4 mt-3 pr-1 bg-gray-100 rounded-md py-1">
      <div className="grow h-9 sm:h-8 flex items-start overflow-hidden border-r border-gray-300 sm:border-none">
        <div className="px-1 w-full overflow-y-hidden flex gap-1 overflow-x-scroll shrink-0">
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

          {DAYS_ORDER.map((day) => (
            <button
              key={day}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDayToggle(day);
              }}
              className={getDayButtonClass(days?.[day] || false)}
            >
              {DAY_LABELS[day]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className={`cursor-pointer font-semibold w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm shrink-0 ${
          days === undefined
            ? "bg-gray-300/80 hover:bg-gray-300 text-gray-700"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {days === undefined ? "닫기" : "저장"}
      </button>
    </div>
  );
};

export default FilterDays;
