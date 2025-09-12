import { cn } from "@/shared/lib/utils";
import { useMemo, useCallback, useState, useEffect, useRef } from "react";

export interface TimeFilter {
  startTime: string;
  endTime: string;
  label: string;
}

interface FilterTimeProps {
  onClose: () => void;
  setFilterValues: (values: { time?: TimeFilter }) => void;
}

// 시간을 표시 형식으로 변환하는 함수
const formatHour = (hour: number): string => {
  if (hour === 0) return "00:00";
  if (hour === 24) return "24:00";
  return `${hour.toString().padStart(2, "0")}:00`;
};

// 라벨 생성 함수
const generateTimeLabel = (startHour: number, endHour: number): string => {
  return `${formatHour(startHour)} - ${formatHour(endHour)}`;
};

const FilterTime = ({ onClose, setFilterValues }: FilterTimeProps) => {
  // 내부 상태로 슬라이더 값 관리
  const [startHour, setStartHour] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(24);
  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);

  // 슬라이더 값 계산 함수
  const calculateValue = useCallback((clientX: number): number => {
    if (!sliderRef.current) return 0;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width)
    );
    return Math.round(percentage * 24);
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
        // startHour는 endHour를 넘을 수 없음
        setStartHour(Math.min(newValue, endHour - 1));
      } else if (isDragging === "end") {
        // endHour는 startHour보다 작을 수 없음
        setEndHour(Math.max(newValue, startHour + 1));
      }
    },
    [isDragging, calculateValue, startHour, endHour]
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
      const distToStart = Math.abs(newValue - startHour);
      const distToEnd = Math.abs(newValue - endHour);

      if (distToStart < distToEnd) {
        setStartHour(Math.min(newValue, endHour - 1));
      } else {
        setEndHour(Math.max(newValue, startHour + 1));
      }
    },
    [calculateValue, startHour, endHour]
  );

  // 저장 핸들러
  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      const timeFilter: TimeFilter = {
        startTime: startHour.toString(),
        endTime: endHour.toString(),
        label: generateTimeLabel(startHour, endHour),
      };
      if (startHour !== 0 || endHour !== 24) {
        setFilterValues({ time: timeFilter });
      }
      onClose();
    },
    [startHour, endHour, setFilterValues, onClose]
  );

  // 전체 선택 핸들러 (0시~24시)
  const handleSelectAll = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setStartHour(0);
      setEndHour(24);
      setFilterValues({ time: undefined });
    },
    [setFilterValues]
  );

  // 현재 라벨 메모이제이션
  const currentLabel = useMemo(
    () => generateTimeLabel(startHour, endHour),
    [startHour, endHour]
  );

  // 전체 버튼 클래스 메모이제이션
  const allButtonClass = useMemo(
    () =>
      cn(
        "cursor-pointer w-16 h-9 sm:h-8 flex items-center justify-center rounded-sm sm:text-sm border transition-colors",
        startHour === 0 && endHour === 24
          ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
          : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
      ),
    [startHour, endHour]
  );

  // 위치 계산
  const startPosition = (startHour / 24) * 100;
  const endPosition = (endHour / 24) * 100;
  const rangeWidth = endPosition - startPosition;

  // 시간 마커 생성 함수
  const timeMarkers = useMemo(() => {
    return [0, 6, 12, 18, 24].map((hour) => formatHour(hour));
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

        {/* 현재 선택된 시간 표시 */}
        <span className="font-medium text-gray-800">{currentLabel}</span>

        {/* 저장 버튼 */}
        <button
          type="button"
          onClick={handleSave}
          className={`cursor-pointer font-semibold w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm shrink-0 ${
            startHour === 0 && endHour === 24
              ? "bg-gray-300/80 hover:bg-gray-300 text-gray-700"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {startHour === 0 && endHour === 24 ? "닫기" : "저장"}
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
                {formatHour(startHour)}
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
                {formatHour(endHour)}
              </div>
            )}
          </div>
        </div>

        {/* 시간 마커 */}
        <div className="flex justify-between text-xs text-gray-500 mt-6 pb-1">
          {timeMarkers.map((marker, index) => (
            <span key={index}>{marker}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterTime;
