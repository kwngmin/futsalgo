import { cn } from "@/shared/lib/utils";
import { useMemo, useCallback, useState } from "react";

export interface TeamMatchAvailableFilter {
  value: boolean;
  label: string;
}

interface FilterTeamMatchAvailableProps {
  onClose: () => void;
  setFilterValues: (values: {
    teamMatchAvailable?: TeamMatchAvailableFilter;
  }) => void;
}

// 상수를 컴포넌트 외부로 이동하여 재렌더링 시 재생성 방지
const MATCH_TYPE_OPTIONS: TeamMatchAvailableFilter[] = [
  { value: true, label: "초청가능" },
  { value: false, label: "초청불가" },
];

const FilterTeamMatchAvailable = ({
  onClose,
  setFilterValues,
}: FilterTeamMatchAvailableProps) => {
  const [teamMatchAvailable, setTeamMatchAvailable] = useState<
    TeamMatchAvailableFilter | undefined
  >(undefined);

  // 옵션 선택 핸들러 메모이제이션
  const handleOptionSelect = useCallback(
    (option?: TeamMatchAvailableFilter) => {
      setTeamMatchAvailable(option);
    },
    [setTeamMatchAvailable]
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
    (e: React.MouseEvent, option: TeamMatchAvailableFilter) => {
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
    () => getButtonClass(teamMatchAvailable === undefined),
    [teamMatchAvailable, getButtonClass]
  );

  // 닫기 핸들러 메모이제이션
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (teamMatchAvailable !== undefined) {
        setFilterValues({ teamMatchAvailable: teamMatchAvailable });
      }
      onClose();
    },
    [onClose, teamMatchAvailable, setFilterValues]
  );

  return (
    <div className="flex items-center justify-between gap-2 mx-4 mt-2 bg-gray-100 rounded-md p-1 pr-2">
      <div className="bg-gray-100 rounded grid grid-cols-3 items-center gap-1">
        <div onClick={handleSelectAll} className={allButtonClass}>
          전체
        </div>

        {MATCH_TYPE_OPTIONS.map((option) => (
          <div
            key={option.value.toString()}
            onClick={(e) => handleOptionClick(e, option)}
            className={getButtonClass(
              teamMatchAvailable?.value === option.value
            )}
          >
            {option.label}
          </div>
        ))}
      </div>

      <div
        onClick={handleClose}
        className={`cursor-pointer font-semibold w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm shrink-0 ${
          teamMatchAvailable === undefined
            ? "bg-gray-300/80 hover:bg-gray-300 text-gray-700"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {teamMatchAvailable === undefined ? "닫기" : "저장"}
      </div>
    </div>
  );
};

export default FilterTeamMatchAvailable;
