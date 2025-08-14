// components/player/PlayerRatingRadarChart.tsx
"use client";

import { TrendingUp } from "lucide-react";

interface RatingItem {
  key: string;
  label: string;
  icon: string;
  value: number;
  maxValue: number;
}

interface Props {
  ratingsData: {
    averageRatings: {
      shooting: number;
      passing: number;
      stamina: number;
      physical: number;
      dribbling: number;
      defense: number;
    };
    totalRatings: number;
    hasRatings: boolean;
  };
}

const RATING_CONFIG = [
  { key: "shooting", label: "슈팅", icon: "⚽", angle: -90 }, // 12시 방향부터 시작
  { key: "passing", label: "패스", icon: "🎯", angle: -30 },
  { key: "stamina", label: "체력", icon: "💪", angle: 30 },
  { key: "physical", label: "피지컬", icon: "🏃", angle: 90 },
  { key: "dribbling", label: "드리블", icon: "⚡", angle: 150 },
  { key: "defense", label: "수비", icon: "🛡️", angle: -150 },
] as const;

const RadarChart = ({ ratings }: { ratings: RatingItem[] }) => {
  const chartRadius = 80; // 차트 반지름
  const labelOffset = 24; // 라벨까지의 거리
  const padding = 20; // SVG 여백

  // 전체 크기 계산 (차트 + 라벨 + 여백)
  const totalSize = (chartRadius + labelOffset + padding) * 2;
  const center = totalSize / 2;

  // 배경 원들 (1~5점 스케일)
  const backgroundCircles = Array.from({ length: 5 }, (_, i) => {
    const level = i + 1;
    return (
      <circle
        key={level}
        cx={center}
        cy={center}
        r={(level / 5) * chartRadius}
        fill="none"
        stroke="#e1e1e1"
        strokeWidth="1"
        opacity={1}
      />
    );
  });

  // 배경 라인들 (축)
  const backgroundLines = RATING_CONFIG.map(({ angle }) => {
    const radian = (angle * Math.PI) / 180;
    const x = center + Math.cos(radian) * chartRadius;
    const y = center + Math.sin(radian) * chartRadius;

    return (
      <line
        key={angle}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="#e1e1e1"
        strokeWidth="1"
        opacity={1}
      />
    );
  });

  // 평가 데이터 포인트들
  const dataPoints = ratings.map(({ value }, index) => {
    const config = RATING_CONFIG[index];
    const radian = (config.angle * Math.PI) / 180;
    const radius = (value / 5) * chartRadius;
    const x = center + Math.cos(radian) * radius;
    const y = center + Math.sin(radian) * radius;

    return { x, y, value, config };
  });

  // 평가 영역 패스 생성
  const pathData =
    dataPoints.length > 0
      ? dataPoints.reduce((path, point, index) => {
          const command = index === 0 ? "M" : "L";
          return `${path} ${command} ${point.x} ${point.y}`;
        }, "") + " Z"
      : "";

  // 라벨 위치 계산 - 각도에 따른 오프셋 조정
  const labels = ratings.map((rating, index) => {
    const config = RATING_CONFIG[index];
    const radian = (config.angle * Math.PI) / 180;
    const labelRadius = chartRadius + labelOffset;

    const x =
      center +
      Math.cos(radian) * labelRadius +
      (rating.key === "defense" || rating.key === "dribbling"
        ? -16
        : rating.key === "passing" || rating.key === "stamina"
        ? 16
        : 0);
    const y = center + Math.sin(radian) * labelRadius;

    // 각도에 따른 텍스트 위치 미세 조정
    let labelY = y - 8;
    let valueY = y + 8;

    // 상단/하단 라벨의 경우 추가 조정
    if (config.angle === -90) {
      // 슈팅 (상단)
      labelY = y - 12;
      valueY = y + 4;
    } else if (config.angle === 90) {
      // 피지컬 (하단)
      labelY = y - 4;
      valueY = y + 12;
    }

    return (
      <g key={config.key}>
        <text
          x={x}
          y={labelY}
          textAnchor="middle"
          fontSize="0.875rem"
          fill="#6b7280"
          dominantBaseline="middle"
        >
          {config.label}
        </text>
        <text
          x={x}
          y={valueY}
          textAnchor="middle"
          fontSize="1rem"
          fontWeight="700"
          fill="#1f2937"
          dominantBaseline="middle"
        >
          {rating.value.toFixed(1)}
        </text>
      </g>
    );
  });

  return (
    <div className="flex justify-center">
      <svg
        width={totalSize}
        height={totalSize}
        viewBox={`0 0 ${totalSize} ${totalSize}`}
        className="max-w-full h-auto"
      >
        {/* 배경 */}
        {backgroundCircles}
        {backgroundLines}

        {/* 평가 영역 */}
        {pathData && (
          <path
            d={pathData}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth="2"
          />
        )}

        {/* 데이터 포인트 */}
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}

        {/* 라벨 */}
        {labels}
      </svg>
    </div>
  );
};

// const getCurrentDateInfo = () => {
//   const currentDate = new Date();
//   return {
//     year: currentDate.getFullYear(),
//     month: currentDate.getMonth() + 1,
//   };
// };

const NoRatingsMessage = () => (
  <div className="border rounded-2xl overflow-hidden flex flex-col">
    <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-b gap-3 bg-neutral-50">
      <div className="flex items-center space-x-3">
        <TrendingUp className="size-5 text-gray-600" />
        <span className="font-medium">팀원 평가</span>
      </div>
      <span className="text-base font-medium text-gray-500">없음</span>
    </div>
    <div className="grow flex flex-col items-center justify-center h-64 pb-4">
      <div className="text-gray-500">아직 받은 평가가 없습니다</div>
      <div className="text-sm text-gray-400">
        팀원들이 평가를 완료하면 여기에 표시됩니다
      </div>
    </div>
  </div>
);

const calculateTotalScore = (ratings: RatingItem[]): string => {
  if (ratings.length === 0) return "0.0";

  const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
  return sum.toFixed(1);
};

const mapRatingsData = (
  averageRatings: Props["ratingsData"]["averageRatings"]
): RatingItem[] => {
  return RATING_CONFIG.map((config) => ({
    key: config.key,
    label: config.label,
    icon: config.icon,
    value: averageRatings[config.key as keyof typeof averageRatings] || 0,
    maxValue: 5,
  }));
};

export default function PlayerRatingRadarChart({ ratingsData }: Props) {
  // const dateInfo = getCurrentDateInfo();

  if (!ratingsData.hasRatings) {
    return (
      <NoRatingsMessage
      // dateInfo={dateInfo}
      />
    );
  }

  const { averageRatings, totalRatings } = ratingsData;
  const ratings = mapRatingsData(averageRatings);
  const totalScore = calculateTotalScore(ratings);

  return (
    <div className="border rounded-2xl overflow-hidden flex flex-col">
      <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-b gap-3 bg-neutral-50">
        <div className="flex items-center space-x-3">
          <TrendingUp className="size-5 text-gray-600" />
          <span className="font-medium">팀원 평가</span>
        </div>
        <span className="text-base font-medium text-gray-500">
          {totalScore}
        </span>
      </div>

      <div className="mx-auto w-full grow space-y-3 flex flex-col justify-center py-10 sm:py-0">
        {/* 레이더 차트 */}
        <RadarChart ratings={ratings} />

        <div className="text-sm text-gray-500 text-center flex items-center justify-center">
          {totalRatings}명의 팀원이 평가
        </div>
      </div>
    </div>
  );
}
