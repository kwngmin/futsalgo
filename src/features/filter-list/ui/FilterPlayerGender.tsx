import { cn } from "@/shared/lib/utils";
import { Gender } from "@prisma/client";
import { useMemo, useCallback, useState } from "react";

export interface PlayerGenderFilter {
  value: Gender;
  label: string;
}

interface FilterPlayerGenderProps {
  onClose: () => void;
  setFilterValues: (values: { gender?: PlayerGenderFilter }) => void;
}

// 상수를 컴포넌트 외부로 이동하여 재렌더링 시 재생성 방지
const MATCH_TYPE_OPTIONS: PlayerGenderFilter[] = [
  { value: Gender.MALE, label: "남자" },
  { value: Gender.FEMALE, label: "여자" },
];

const FilterPlayerGender = ({
  onClose,
  setFilterValues,
}: FilterPlayerGenderProps) => {
  const [gender, setGender] = useState<PlayerGenderFilter | undefined>(
    undefined
  );

  // 옵션 선택 핸들러 메모이제이션
  const handleOptionSelect = useCallback(
    (option?: PlayerGenderFilter) => {
      setGender(option);
    },
    [setGender]
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
    (e: React.MouseEvent, option: PlayerGenderFilter) => {
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
    () => getButtonClass(gender === undefined),
    [gender, getButtonClass]
  );

  // 닫기 핸들러 메모이제이션
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (gender !== undefined) {
        setFilterValues({ gender: gender });
      }
      onClose();
    },
    [onClose, gender, setFilterValues]
  );

  return (
    <div className="flex items-center justify-between gap-2 mx-4 mt-2 bg-gray-100 rounded-md p-1 pr-2">
      <div className="bg-gray-100 rounded grid grid-cols-3 items-center gap-1">
        <div onClick={handleSelectAll} className={allButtonClass}>
          전체
        </div>

        {MATCH_TYPE_OPTIONS.map((option) => (
          <div
            key={option.value}
            onClick={(e) => handleOptionClick(e, option)}
            className={getButtonClass(gender?.value === option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>

      <div
        onClick={handleClose}
        className={`cursor-pointer font-semibold w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm shrink-0 ${
          gender === undefined
            ? "bg-gray-300/80 hover:bg-gray-300 text-gray-700"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {gender === undefined ? "닫기" : "저장"}
      </div>
    </div>
  );
};

export default FilterPlayerGender;
