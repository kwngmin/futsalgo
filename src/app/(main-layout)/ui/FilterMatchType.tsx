import { cn } from "@/shared/lib/utils";
import { useMemo, useCallback } from "react";

type MatchTypeValue = "TEAM" | "SQUAD";

export interface MatchTypeOption {
  value: MatchTypeValue;
  label: string;
}

interface FilterMatchTypeProps {
  onClose: () => void;
  filterValues: {
    matchType?: MatchTypeOption;
  };
  setFilterValues: (values: { matchType?: MatchTypeOption }) => void;
}

// 상수를 컴포넌트 외부로 이동하여 재렌더링 시 재생성 방지
const MATCH_TYPE_OPTIONS: MatchTypeOption[] = [
  { value: "SQUAD", label: "자체전" },
  { value: "TEAM", label: "친선전" },
];

const FilterMatchType = ({
  onClose,
  filterValues,
  setFilterValues,
}: FilterMatchTypeProps) => {
  // 옵션 선택 핸들러 메모이제이션
  const handleOptionSelect = useCallback(
    (option?: MatchTypeOption) => {
      setFilterValues({ matchType: option });
    },
    [setFilterValues]
  );

  // 전체 선택 핸들러 메모이제이션
  const handleSelectAll = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleOptionSelect(undefined);
    },
    [handleOptionSelect]
  );

  // 옵션 선택 핸들러 메모이제이션
  const handleOptionClick = useCallback(
    (e: React.MouseEvent, option: MatchTypeOption) => {
      e.stopPropagation();
      handleOptionSelect(option);
    },
    [handleOptionSelect]
  );

  // 버튼 클래스 생성 함수 메모이제이션
  const getButtonClass = useCallback((isSelected: boolean) => {
    return cn(
      "cursor-pointer w-16 sm:w-24 h-10 sm:h-9 flex items-center justify-center rounded-sm sm:text-sm border transition-colors",
      isSelected
        ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
        : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
    );
  }, []);

  // 전체 버튼 클래스 메모이제이션
  const allButtonClass = useMemo(
    () => getButtonClass(filterValues.matchType === undefined),
    [filterValues.matchType, getButtonClass]
  );

  // 닫기 핸들러 메모이제이션
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose();
    },
    [onClose]
  );

  return (
    <div className="flex items-center justify-between gap-2 mx-4 mt-3 bg-gray-100 rounded-md p-1">
      <div className="bg-gray-100 rounded grid grid-cols-3 items-center gap-1">
        <div onClick={handleSelectAll} className={allButtonClass}>
          전체
        </div>

        {MATCH_TYPE_OPTIONS.map((option) => (
          <div
            key={option.value}
            onClick={(e) => handleOptionClick(e, option)}
            className={getButtonClass(
              filterValues.matchType?.value === option.value
            )}
          >
            {option.label}
          </div>
        ))}
      </div>

      <div
        onClick={handleClose}
        className="cursor-pointer font-medium w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm bg-indigo-600 text-white hover:bg-indigo-600/80 active:scale-98 transition-all"
      >
        저장
      </div>
    </div>
  );
};

export default FilterMatchType;
