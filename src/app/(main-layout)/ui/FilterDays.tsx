import { cn } from "@/shared/lib/utils";
import { useMemo, useCallback } from "react";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface DaysFilter {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
  label: string;
}

interface FilterDaysProps {
  onClose: () => void;
  filterValues: {
    days?: DaysFilter;
  };
  setFilterValues: (values: { days?: DaysFilter }) => void;
}

// 상수를 컴포넌트 외부로 이동하여 재렌더링 시 재생성 방지
const DAY_LABELS: Record<DayKey, string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
  sun: "일",
};

const DAYS_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const WEEKDAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];
const WEEKEND_DAYS: DayKey[] = ["sat", "sun"];

// 초기 필터 상태를 생성하는 헬퍼 함수
const createInitialDaysFilter = (): Omit<DaysFilter, "label"> => ({
  mon: false,
  tue: false,
  wed: false,
  thu: false,
  fri: false,
  sat: false,
  sun: false,
});

const FilterDays = ({
  onClose,
  filterValues,
  setFilterValues,
}: FilterDaysProps) => {
  console.log(filterValues, "filterValues");
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

      // return selectedLabels.join(" • ");
      return selectedLabels.join(", ");
    },
    []
  );

  // 현재 선택된 요일들과 라벨을 메모이제이션
  const currentDays = useMemo(
    () => filterValues.days || createInitialDaysFilter(),
    [filterValues.days]
  );

  const handleDayToggle = useCallback(
    (day: DayKey) => {
      const newDays = {
        ...currentDays,
        [day]: !currentDays[day],
      };

      const label = generateLabel(newDays);

      setFilterValues({
        days: {
          ...newDays,
          label,
        },
      });
    },
    [currentDays, generateLabel, setFilterValues]
  );

  const handleSelectAll = useCallback(() => {
    setFilterValues({ days: undefined });
  }, [setFilterValues]);

  // 버튼 클래스 생성 함수 메모이제이션
  const getDayButtonClass = useCallback((isSelected: boolean) => {
    return cn(
      "shrink-0 cursor-pointer size-10 sm:size-9 flex items-center justify-center rounded-sm sm:text-sm border transition-colors",
      isSelected
        ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
        : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
    );
  }, []);

  // 전체 버튼 클래스 메모이제이션
  const allButtonClass = useMemo(
    () =>
      cn(
        "cursor-pointer w-12 h-10 sm:h-9 flex items-center justify-center rounded-sm sm:text-sm border transition-colors shrink-0",
        filterValues.days === undefined
          ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
          : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
      ),
    [filterValues.days]
  );

  return (
    <div className="flex gap-2 mx-4 mt-3 bg-gray-100 rounded-md py-1">
      <div className="grow h-10 sm:h-9 flex items-center overflow-hidden">
        <div className="px-1 w-full overflow-y-hidden flex gap-1 overflow-x-scroll shrink-0">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleSelectAll();
            }}
            className={allButtonClass}
          >
            전체
          </div>

          {DAYS_ORDER.map((day) => (
            <div
              key={day}
              onClick={(e) => {
                e.stopPropagation();
                handleDayToggle(day);
              }}
              className={getDayButtonClass(filterValues.days?.[day] || false)}
            >
              {DAY_LABELS[day]}
            </div>
          ))}
        </div>
      </div>

      <div
        onClick={onClose}
        className="cursor-pointer font-medium w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm bg-indigo-600 text-white hover:bg-indigo-600/80 active:scale-98 transition-all shrink-0"
      >
        저장
      </div>
    </div>
  );
};

export default FilterDays;
