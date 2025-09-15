import { cn } from "@/shared/lib/utils";
import { useMemo, useCallback, useState, useEffect, useRef } from "react";

export interface PlayerAgeFilter {
  lowerAge: string;
  higherAge: string;
  label: string;
}

interface FilterPlayerAgeProps {
  onClose: () => void;
  setFilterValues: (values: { age?: PlayerAgeFilter }) => void;
}

// 나이 범위 상수
const MIN_AGE = 10;
const MAX_AGE = 60;

// 라벨 생성 함수
const generateAgeLabel = (lowerAge: number, higherAge: number): string => {
  return `${lowerAge}세 - ${higherAge}세`;
};

const FilterPlayerAge = ({
  onClose,
  setFilterValues,
}: FilterPlayerAgeProps) => {
  // 내부 상태로 슬라이더 값 관리
  const [lowerAge, setLowerAge] = useState<number>(MIN_AGE);
  const [higherAge, setHigherAge] = useState<number>(MAX_AGE);
  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);

  // 슬라이더 값 계산 함수 (나이 범위에 맞게 수정)
  const calculateValue = useCallback((clientX: number): number => {
    if (!sliderRef.current) return MIN_AGE;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width)
    );
    return Math.round(MIN_AGE + percentage * (MAX_AGE - MIN_AGE));
  }, []);

  // 마우스/터치 이벤트 핸들러
  const handlePointerDown = useCallback(
    (type: "start" | "end") => (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsDragging(type);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const newValue = calculateValue(clientX);

      if (isDragging === "start") {
        // lowerAge는 higherAge를 넘을 수 없음
        setLowerAge(Math.min(newValue, higherAge - 1));
      } else if (isDragging === "end") {
        // higherAge는 lowerAge보다 작을 수 없음
        setHigherAge(Math.max(newValue, lowerAge + 1));
      }
    },
    [isDragging, calculateValue, lowerAge, higherAge]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // 글로벌 이벤트 리스너 등록
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e: MouseEvent | TouchEvent) => handlePointerMove(e);
      const handleUp = () => handlePointerUp();

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleUp);

      return () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // 트랙 클릭 핸들러
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const newValue = calculateValue(e.clientX);

      // 클릭한 위치가 시작점에 더 가까운지 끝점에 더 가까운지 판단
      const distToStart = Math.abs(newValue - lowerAge);
      const distToEnd = Math.abs(newValue - higherAge);

      if (distToStart < distToEnd) {
        setLowerAge(Math.min(newValue, higherAge - 1));
      } else {
        setHigherAge(Math.max(newValue, lowerAge + 1));
      }
    },
    [calculateValue, lowerAge, higherAge]
  );

  // 저장 핸들러
  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      const ageFilter: PlayerAgeFilter = {
        lowerAge: lowerAge.toString(),
        higherAge: higherAge.toString(),
        label: generateAgeLabel(lowerAge, higherAge),
      };

      // 전체 범위가 아닌 경우에만 필터 적용
      if (lowerAge !== MIN_AGE || higherAge !== MAX_AGE) {
        setFilterValues({ age: ageFilter });
      } else {
        setFilterValues({ age: undefined });
      }
      onClose();
    },
    [lowerAge, higherAge, setFilterValues, onClose]
  );

  // 전체 선택 핸들러
  const handleSelectAll = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLowerAge(MIN_AGE);
      setHigherAge(MAX_AGE);
      setFilterValues({ age: undefined });
    },
    [setFilterValues]
  );

  // 현재 라벨 메모이제이션
  const currentLabel = useMemo(
    () => generateAgeLabel(lowerAge, higherAge),
    [lowerAge, higherAge]
  );

  // 전체 버튼 클래스 메모이제이션
  const allButtonClass = useMemo(
    () =>
      cn(
        "cursor-pointer w-16 h-9 sm:h-8 flex items-center justify-center rounded-sm sm:text-sm border transition-colors",
        lowerAge === MIN_AGE && higherAge === MAX_AGE
          ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
          : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
      ),
    [lowerAge, higherAge]
  );

  // 위치 계산 (나이 범위에 맞게 수정)
  const startPosition = ((lowerAge - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100;
  const endPosition = ((higherAge - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100;
  const rangeWidth = endPosition - startPosition;

  // 나이 마커 생성 함수
  const ageMarkers = useMemo(() => {
    const markers = [];
    for (let age = MIN_AGE; age <= MAX_AGE; age += 10) {
      markers.push(age);
    }
    // 마지막 값이 MAX_AGE가 아니면 추가
    if (markers[markers.length - 1] !== MAX_AGE) {
      markers.push(MAX_AGE);
    }
    return markers.map((age) => `${age}세`);
  }, []);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-gray-100 rounded flex flex-col gap-6 p-1 flex-1 mx-4 mt-2 select-none"
    >
      <div className="flex items-center justify-between">
        {/* 전체 선택 버튼 */}
        <button
          type="button"
          onClick={handleSelectAll}
          className={allButtonClass}
        >
          전체
        </button>

        {/* 현재 선택된 나이 표시 */}
        <span className="font-medium text-gray-800">{currentLabel}</span>

        {/* 저장 버튼 */}
        <button
          type="button"
          onClick={handleSave}
          className={`cursor-pointer font-semibold w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm shrink-0 ${
            lowerAge === MIN_AGE && higherAge === MAX_AGE
              ? "bg-gray-300/80 hover:bg-gray-300 text-gray-700"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {lowerAge === MIN_AGE && higherAge === MAX_AGE ? "닫기" : "저장"}
        </button>
      </div>

      {/* 듀얼 레인지 슬라이더 */}
      <div className="relative px-4">
        <div
          ref={sliderRef}
          className="relative h-1 bg-gray-200 rounded-lg cursor-pointer"
          onClick={handleTrackClick}
        >
          {/* 선택된 범위 표시 */}
          <div
            className="absolute h-full bg-indigo-500 rounded-lg pointer-events-none"
            style={{
              left: `${startPosition}%`,
              width: `${rangeWidth}%`,
            }}
          />

          {/* 시작 썸 */}
          <div
            className={cn(
              "absolute top-1/2 size-5 bg-white border-2 border-indigo-500 rounded-full cursor-grab shadow-md transition-transform hover:scale-110",
              isDragging === "start" && "cursor-grabbing scale-110"
            )}
            style={{
              left: `${startPosition}%`,
              transform: `translateX(-50%) translateY(-50%)`,
              zIndex: isDragging === "start" ? 20 : 10,
            }}
            onMouseDown={handlePointerDown("start")}
            onTouchStart={handlePointerDown("start")}
          >
            {/* 툴팁 */}
            {isDragging === "start" && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                {lowerAge}세
              </div>
            )}
          </div>

          {/* 종료 썸 */}
          <div
            className={cn(
              "absolute top-1/2 size-5 bg-white border-2 border-indigo-500 rounded-full cursor-grab shadow-md transition-transform hover:scale-110",
              isDragging === "end" && "cursor-grabbing scale-110"
            )}
            style={{
              left: `${endPosition}%`,
              transform: `translateX(-50%) translateY(-50%)`,
              zIndex: isDragging === "end" ? 20 : 10,
            }}
            onMouseDown={handlePointerDown("end")}
            onTouchStart={handlePointerDown("end")}
          >
            {/* 툴팁 */}
            {isDragging === "end" && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                {higherAge}세
              </div>
            )}
          </div>
        </div>

        {/* 나이 마커 */}
        <div className="flex justify-between text-xs text-gray-500 mt-6 pb-1">
          {ageMarkers.map((marker, index) => (
            <span key={index}>{marker}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPlayerAge;
