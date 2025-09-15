import { cn } from "@/shared/lib/utils";
import { PlayerBackground } from "@prisma/client";
import { useMemo, useCallback, useState } from "react";

export interface PlayerBackgroundFilter {
  value: PlayerBackground;
  label: string;
}

interface FilterPlayerBackgroundProps {
  onClose: () => void;
  setFilterValues: (values: { background?: PlayerBackgroundFilter }) => void;
}

// 상수를 컴포넌트 외부로 이동하여 재렌더링 시 재생성 방지
const PLAYER_BACKGROUND_OPTIONS: PlayerBackgroundFilter[] = [
  { value: PlayerBackground.PROFESSIONAL, label: "선수 출신" },
  { value: PlayerBackground.NON_PROFESSIONAL, label: "비선수 출신" },
];

const FilterPlayerBackground = ({
  onClose,
  setFilterValues,
}: FilterPlayerBackgroundProps) => {
  const [background, setBackground] = useState<
    PlayerBackgroundFilter | undefined
  >(undefined);

  // 옵션 선택 핸들러 메모이제이션
  const handleOptionSelect = useCallback(
    (option?: PlayerBackgroundFilter) => {
      setBackground(option);
    },
    [setBackground]
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
    (e: React.MouseEvent, option: PlayerBackgroundFilter) => {
      e.stopPropagation();
      handleOptionSelect(option);
    },
    [handleOptionSelect]
  );

  // 버튼 클래스 생성 함수 메모이제이션
  const getButtonClass = useCallback((isSelected: boolean) => {
    return cn(
      "cursor-pointer min-w-20 sm:min-w-24 px-4 h-11 sm:h-10 md:h-9 flex items-center justify-center rounded-sm sm:text-sm border transition-colors shrink-0",
      isSelected
        ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
        : "text-muted-foreground font-medium hover:bg-gray-200 border-transparent hover:text-gray-600"
    );
  }, []);

  // 전체 버튼 클래스 메모이제이션
  const allButtonClass = useMemo(
    () => getButtonClass(background === undefined),
    [background, getButtonClass]
  );

  // 닫기 핸들러 메모이제이션
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (background !== undefined) {
        setFilterValues({ background: background });
      }
      onClose();
    },
    [onClose, background, setFilterValues]
  );

  return (
    <div className="flex items-center gap-2 mx-4 mt-2 pr-2 bg-gray-100 rounded-md py-1">
      <div className="grow h-11 sm:h-10 md:h-9 flex items-start overflow-hidden border-r border-gray-300 sm:border-none">
        <div className="pl-1 pr-2 w-full overflow-y-hidden flex gap-1 overflow-x-scroll shrink-0">
          <button onClick={handleSelectAll} className={allButtonClass}>
            전체
          </button>

          {PLAYER_BACKGROUND_OPTIONS.map((option) => (
            <div
              key={option.value}
              onClick={(e) => handleOptionClick(e, option)}
              className={getButtonClass(background?.value === option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>

      <div
        onClick={handleClose}
        className={`cursor-pointer font-semibold w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm shrink-0 ${
          background === undefined
            ? "bg-gray-300/80 hover:bg-gray-300 text-gray-700"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {background === undefined ? "닫기" : "저장"}
      </div>
    </div>
  );
};

export default FilterPlayerBackground;
