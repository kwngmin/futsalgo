// components/player/player-rating-radar-chart.tsx
"use client";

import { ChevronRight, TrendingUp } from "lucide-react";

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
  { key: "shooting", label: "슈팅", icon: "⚽", angle: 0 },
  { key: "passing", label: "패스", icon: "🎯", angle: 60 },
  { key: "stamina", label: "체력", icon: "💪", angle: 120 },
  { key: "physical", label: "피지컬", icon: "🏃", angle: 180 },
  { key: "dribbling", label: "드리블", icon: "⚡", angle: 240 },
  { key: "defense", label: "수비", icon: "🛡️", angle: 300 },
] as const;

const RadarChart = ({ ratings }: { ratings: RatingItem[] }) => {
  const size = 200;
  const center = size / 2;
  const maxRadius = 80;

  // 배경 원들 (1~5점 스케일)
  const backgroundCircles = [1, 2, 3, 4, 5].map((level) => (
    <circle
      key={level}
      cx={center}
      cy={center}
      r={(level / 5) * maxRadius}
      fill="none"
      stroke="#e5e7eb"
      strokeWidth="1"
      opacity={0.5}
    />
  ));

  // 배경 라인들 (축)
  const backgroundLines = RATING_CONFIG.map(({ angle }) => {
    const radian = (angle * Math.PI) / 180;
    const x = center + Math.cos(radian) * maxRadius;
    const y = center + Math.sin(radian) * maxRadius;

    return (
      <line
        key={angle}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="#e5e7eb"
        strokeWidth="1"
        opacity={0.5}
      />
    );
  });

  // 평가 데이터 포인트들
  const dataPoints = ratings.map(({ value }, index) => {
    const config = RATING_CONFIG[index];
    const radian = (config.angle * Math.PI) / 180;
    const radius = (value / 5) * maxRadius;
    const x = center + Math.cos(radian) * radius;
    const y = center + Math.sin(radian) * radius;

    return { x, y, value, config };
  });

  // 평가 영역 패스 생성
  const pathData =
    dataPoints.reduce((path, point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${path} ${command} ${point.x} ${point.y}`;
    }, "") + " Z";

  // 라벨 위치 계산
  const labels = ratings.map((rating, index) => {
    const config = RATING_CONFIG[index];
    const radian = (config.angle * Math.PI) / 180;
    const labelRadius = maxRadius + 25;
    const x = center + Math.cos(radian) * labelRadius;
    const y = center + Math.sin(radian) * labelRadius;

    return (
      <g key={config.key}>
        <text
          x={x}
          y={y - 8}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill="#374151"
        >
          {config.icon}
        </text>
        <text x={x} y={y + 6} textAnchor="middle" fontSize="10" fill="#6b7280">
          {config.label}
        </text>
        <text
          x={x}
          y={y + 18}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#1f2937"
        >
          {rating.value.toFixed(1)}
        </text>
      </g>
    );
  });

  return (
    <div className="flex justify-center">
      <svg width={size + 50} height={size + 50} className="overflow-visible">
        {/* 배경 */}
        {backgroundCircles}
        {backgroundLines}

        {/* 평가 영역 */}
        <path
          d={pathData}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="#3b82f6"
          strokeWidth="2"
        />

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

export default function PlayerRatingRadarChart({ ratingsData }: Props) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  if (!ratingsData.hasRatings) {
    return (
      <div className="border rounded-2xl overflow-hidden mx-4">
        <div className="w-full flex items-center justify-between px-4 py-3 border-b gap-3 bg-neutral-50">
          <div className="flex items-center space-x-3">
            <TrendingUp className="size-5 text-gray-600" />
            <span className="font-medium">팀원 평가</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">
              {currentYear}년 {currentMonth}월
            </span>
            <ChevronRight className="size-5 text-gray-400" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 space-y-2">
          <div className="text-gray-500">아직 받은 평가가 없습니다</div>
          <div className="text-sm text-gray-400">
            팀원들이 평가를 완료하면 여기에 표시됩니다
          </div>
        </div>
      </div>
    );
  }

  const { averageRatings, totalRatings } = ratingsData;

  const ratings: RatingItem[] = RATING_CONFIG.map((config) => ({
    key: config.key,
    label: config.label,
    icon: config.icon,
    value: averageRatings[config.key as keyof typeof averageRatings] || 0,
    maxValue: 5,
  }));

  const overallRating = (
    ratings.reduce((sum, rating) => sum + rating.value, 0) / ratings.length
  ).toFixed(1);

  return (
    <div className="border rounded-2xl overflow-hidden mx-4">
      <div className="w-full flex items-center justify-between px-4 py-3 border-b gap-3 bg-neutral-50">
        <div className="flex items-center space-x-3">
          <TrendingUp className="size-5 text-gray-600" />
          <span className="font-medium">팀원 평가</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">
            {currentYear}년 {currentMonth}월
          </span>
          <ChevronRight className="size-5 text-gray-400" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* 종합 평점 */}
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold text-blue-600">
            {overallRating}
          </div>
          <div className="text-sm text-gray-500">
            {totalRatings}명의 팀원이 평가
          </div>
        </div>

        {/* 레이더 차트 */}
        <RadarChart ratings={ratings} />

        {/* 상세 수치 */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          {ratings.map((rating, index) => (
            <div key={rating.key} className="text-center space-y-1">
              <div className="text-lg">{RATING_CONFIG[index].icon}</div>
              <div className="text-xs text-gray-600">{rating.label}</div>
              <div className="font-semibold">{rating.value.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
