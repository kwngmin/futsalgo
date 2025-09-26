import { cn } from "@/shared/lib/utils";
import { useMemo, useCallback, useState } from "react";

export interface TeamHasFormerProFilter {
  value: string;
  label: string;
}

interface FilterTeamHasFormerProProps {
  onClose: () => void;
  setFilterValues: (values: { hasFormerPro?: TeamHasFormerProFilter }) => void;
}

// 상수를 컴포넌트 외부로 이동하여 재렌더링 시 재생성 방지
const HAS_FORMER_PRO_OPTIONS: TeamHasFormerProFilter[] = [
  { value: "TRUE", label: "선출 있음" },
  { value: "FALSE", label: "선출 없음" },
];

const FilterTeamHasFormerPro = ({
  onClose,
  setFilterValues,
}: FilterTeamHasFormerProProps) => {
  const [hasFormerPro, setHasFormerPro] = useState<
    TeamHasFormerProFilter | undefined
  >(undefined);

  // 옵션 선택 핸들러 메모이제이션
  const handleOptionSelect = useCallback(
    (option?: TeamHasFormerProFilter) => {
      setHasFormerPro(option);
    },
    [setHasFormerPro]
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
    (e: React.MouseEvent, option: TeamHasFormerProFilter) => {
      e.stopPropagation();
      handleOptionSelect(option);
    },
    [handleOptionSelect]
  );

  // 버튼 클래스 생성 함수 메모이제이션
  const getButtonClass = useCallback((isSelected: boolean) => {
    return cn(
      "cursor-pointer w-20 sm:w-24 h-11 sm:h-10 md:h-9 flex items-center justify-center rounded-sm sm:text-sm border transition-colors",
      isSelected
        ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
        : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
    );
  }, []);

  // 전체 버튼 클래스 메모이제이션
  const allButtonClass = useMemo(
    () => getButtonClass(hasFormerPro === undefined),
    [hasFormerPro, getButtonClass]
  );

  // 닫기 핸들러 메모이제이션
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasFormerPro !== undefined) {
        setFilterValues({ hasFormerPro: hasFormerPro });
      }
      onClose();
    },
    [onClose, hasFormerPro, setFilterValues]
  );

  return (
    <div className="flex items-center justify-between gap-2 mx-4 mt-2 bg-gray-100 rounded-md p-1 pr-2">
      <div className="bg-gray-100 rounded grid grid-cols-3 items-center gap-1">
        <div onClick={handleSelectAll} className={allButtonClass}>
          전체
        </div>

        {HAS_FORMER_PRO_OPTIONS.map((option) => (
          <div
            key={option.value}
            onClick={(e) => handleOptionClick(e, option)}
            className={getButtonClass(hasFormerPro?.value === option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>

      <div
        onClick={handleClose}
        className={`cursor-pointer font-semibold w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm shrink-0 ${
          hasFormerPro === undefined
            ? "bg-gray-300/80 hover:bg-gray-300 text-gray-700"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {hasFormerPro === undefined ? "닫기" : "저장"}
      </div>
    </div>
  );
};

export default FilterTeamHasFormerPro;
