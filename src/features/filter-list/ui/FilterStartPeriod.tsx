"use client";

import { cn } from "@/shared/lib/utils";
import { Period } from "@prisma/client";
import { useMemo, useCallback, useState } from "react";

export interface StartPeriodFilter {
  [Period.DAWN]: boolean;
  [Period.MORNING]: boolean;
  [Period.DAY]: boolean;
  [Period.EVENING]: boolean;
  [Period.NIGHT]: boolean;
  label: string;
}

interface FilterStartPeriodProps {
  onClose: () => void;
  setFilterValues: (values: { startPeriod?: StartPeriodFilter }) => void;
}

// 상수를 컴포넌트 외부로 이동하여 재렌더링 시 재생성 방지
const START_PERIOD_LABELS: Record<Period, string> = {
  [Period.DAWN]: "새벽",
  [Period.MORNING]: "아침",
  [Period.DAY]: "낮",
  [Period.EVENING]: "저녁",
  [Period.NIGHT]: "밤",
};

const START_PERIOD_ORDER: Period[] = [
  Period.DAWN,
  Period.MORNING,
  Period.DAY,
  Period.EVENING,
  Period.NIGHT,
];

// 초기 필터 상태를 생성하는 헬퍼 함수
const createInitialStartPeriodFilter = (): Omit<
  StartPeriodFilter,
  "label"
> => ({
  [Period.DAWN]: false,
  [Period.MORNING]: false,
  [Period.DAY]: false,
  [Period.EVENING]: false,
  [Period.NIGHT]: false,
});

const FilterStartPeriod = ({
  onClose,
  setFilterValues,
}: FilterStartPeriodProps) => {
  const [startPeriod, setStartPeriod] = useState<StartPeriodFilter | undefined>(
    undefined
  );

  // 라벨 생성 로직 개선 및 메모이제이션
  const generateLabel = useCallback(
    (periods: Omit<StartPeriodFilter, "label">): string => {
      // DayKey만 필터링하여 label 속성 제외
      const selectedDays = START_PERIOD_ORDER.filter(
        (period) => periods[period]
      );

      if (selectedDays.length === 0) return "";

      const selectedLabels = selectedDays.map(
        (period) => START_PERIOD_LABELS[period]
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
    () => startPeriod || createInitialStartPeriodFilter(),
    [startPeriod]
  );

  const handlePeriodToggle = useCallback(
    (period: Period) => {
      const newPeriods = {
        ...currentDays,
        [period]: !currentDays[period],
      };

      // 선택된 시간대 개수 확인
      const selectedCount = START_PERIOD_ORDER.filter(
        (p) => newPeriods[p]
      ).length;

      // 모든 시간대가 선택되었거나, 아무것도 선택되지 않았으면 undefined로 설정
      if (selectedCount === 0 || selectedCount === START_PERIOD_ORDER.length) {
        setStartPeriod(undefined);
        return;
      }

      const label = generateLabel(newPeriods);

      setStartPeriod({
        ...newPeriods,
        label,
      });
    },
    [currentDays, generateLabel]
  );

  const handleSelectAll = useCallback(() => {
    setStartPeriod(undefined);
  }, []);

  // 버튼 클래스 생성 함수 메모이제이션
  const getPeriodButtonClass = useCallback((isSelected: boolean) => {
    return cn(
      "shrink-0 cursor-pointer w-20 sm:w-16 h-11 sm:h-10 md:h-9 lg:h-8 flex items-center justify-center rounded-sm sm:text-sm border transition-colors",
      isSelected
        ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
        : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
    );
  }, []);

  // 전체 버튼 클래스 메모이제이션
  const allButtonClass = useMemo(
    () =>
      cn(
        "cursor-pointer w-20 sm:w-24 h-11 sm:h-10 md:h-9 lg:h-8 flex items-center justify-center rounded-sm sm:text-sm border transition-colors shrink-0",
        startPeriod === undefined
          ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
          : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
      ),
    [startPeriod]
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (startPeriod !== undefined) {
        setFilterValues({ startPeriod: startPeriod });
      }
      onClose();
    },
    [onClose, startPeriod, setFilterValues]
  );

  return (
    <div className="flex items-center gap-2 mx-4 mt-2 pr-2 bg-gray-100 rounded-md py-1">
      <div className="grow h-11 sm:h-10 md:h-9 lg:h-8 flex items-start overflow-hidden border-r border-gray-300 sm:border-none">
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

          {START_PERIOD_ORDER.map((day) => (
            <button
              key={day}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePeriodToggle(day);
              }}
              className={getPeriodButtonClass(startPeriod?.[day] || false)}
            >
              {START_PERIOD_LABELS[day]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className={`cursor-pointer font-semibold w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm shrink-0 ${
          startPeriod === undefined
            ? "bg-gray-300/80 hover:bg-gray-300 text-gray-700"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {startPeriod === undefined ? "닫기" : "저장"}
      </button>
    </div>
  );
};

export default FilterStartPeriod;
