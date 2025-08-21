// components/player/PlayerRatingRadarChart.tsx
"use client";

import { UserRoundSearch } from "lucide-react";

interface RatingItem {
  key: string;
  label: string;
  abbr: string;
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
  // 12시 방향부터 시작
  { key: "shooting", abbr: "SHT", label: "슈팅", angle: -90 },
  { key: "passing", abbr: "PAS", label: "패스", angle: -30 },
  { key: "stamina", abbr: "STA", label: "체력", angle: 30 },
  { key: "physical", abbr: "PHY", label: "피지컬", angle: 90 },
  { key: "dribbling", abbr: "DRI", label: "드리블", angle: 150 },
  { key: "defense", abbr: "DEF", label: "수비", angle: 210 },
] as const;

// 점수에 따른 색상 매핑 함수
const getColorByScore = (score: number) => {
  if (score >= 4)
    return {
      bg: "#01AA3E",
      bgWithOpacity: "rgba(1, 170, 62, 0.1)",
      text: "#006B28",
    }; // 초록
  if (score >= 3)
    return {
      bg: "#7CAE00",
      bgWithOpacity: "rgba(124, 174, 0, 0.1)",
      text: "#5A8200",
    }; // 연두
  if (score >= 2)
    return {
      bg: "#D19F02",
      bgWithOpacity: "rgba(209, 159, 2, 0.1)",
      text: "#A17A01",
    }; // 노랑
  if (score > 1)
    return {
      bg: "#CA7302",
      bgWithOpacity: "rgba(202, 115, 2, 0.1)",
      text: "#985501",
    }; // 주황
  return {
    bg: "#B70005",
    bgWithOpacity: "rgba(183, 0, 5, 0.1)",
    text: "#8B0004",
  }; // 빨강
};

const RadarChart = ({
  ratings,
  isMobile,
}: {
  ratings: RatingItem[];
  isMobile?: boolean;
}) => {
  const chartRadius = isMobile ? 100 : 80; // 차트 반지름
  const labelOffset = 16; // 라벨까지의 거리
  const padding = 28; // SVG 여백

  // 전체 크기 계산 (차트 + 라벨 + 여백)
  const totalSize = (chartRadius + labelOffset + padding) * 2;
  const center = totalSize / 2;

  // 배경 육각형들 (1~5점 스케일) - 바깥쪽부터 안쪽으로
  const backgroundPolygons = Array.from({ length: 5 }, (_, i) => {
    const level = 5 - i; // 5부터 1까지 (바깥쪽부터)
    const radius = (level / 5) * chartRadius;

    const points = RATING_CONFIG.map(({ angle }) => {
      const radian = (angle * Math.PI) / 180;
      const x = center + Math.cos(radian) * radius;
      const y = center + Math.sin(radian) * radius;
      return `${x},${y}`;
    }).join(" ");

    // 색상 배열 (바깥쪽부터 안쪽으로: 녹색 -> 빨간색)
    const colors = ["#01AA3E", "#7CAE00", "#D19F02", "#CA7302", "#B70005"];

    return (
      <polygon
        key={level}
        points={points}
        fill={colors[i]}
        stroke="none"
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
        stroke="#ffffff"
        strokeWidth="1"
        opacity={0.5}
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

  // 라벨 위치 계산
  const labels = ratings.map((rating, index) => {
    const config = RATING_CONFIG[index];
    const radian = (config.angle * Math.PI) / 180;
    const labelRadius = chartRadius + labelOffset;

    const x = center + Math.cos(radian) * labelRadius;
    const y = center + Math.sin(radian) * labelRadius;

    // 텍스트 정렬 방식 결정
    let textAnchor: "start" | "middle" | "end" = "middle";
    let dominantBaseline: "middle" | "hanging" | "text-before-edge" = "middle";
    let yOffset = 0;

    if (config.angle === -90) {
      dominantBaseline = "middle"; // 위쪽
      // yOffset = -8; // 슈팅 라벨을 더 위로
    } else if (config.angle === 90) {
      // dominantBaseline = "hanging"; // 아래쪽
      dominantBaseline = "middle"; // 아래쪽
      yOffset = 4; // 피지컬 라벨을 더 아래로
    } else if (config.angle > 90 || config.angle < -90) {
      textAnchor = "end"; // 왼쪽
    } else if (config.angle < 90 && config.angle > -90) {
      textAnchor = "start"; // 오른쪽
    }

    return (
      <g key={config.key}>
        <text
          x={x}
          y={y + yOffset}
          textAnchor={textAnchor}
          fontSize={isMobile ? "1rem" : "0.875rem"}
          fill="#1f2937"
          fontWeight="600"
          dominantBaseline={dominantBaseline}
        >
          {config.label}
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
        {backgroundPolygons}
        {backgroundLines}

        {/* 평가 영역 */}
        {pathData && (
          <path
            d={pathData}
            fill="rgba(255, 255, 255, 0.5)"
            stroke="#ffffff"
            strokeWidth="2"
          />
        )}

        {/* 라벨 */}
        {labels}
      </svg>
    </div>
  );
};

const NoRatingsMessage = () => (
  <div className="border rounded-2xl overflow-hidden flex flex-col mx-4">
    <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-b gap-3 bg-neutral-50">
      <div className="flex items-center space-x-3">
        <UserRoundSearch className="size-5 text-gray-600" />
        <span className="font-medium">분석</span>
      </div>
      {/* <span className="text-base font-medium text-gray-500">없음</span> */}
    </div>
    <div className="grow flex flex-col items-center justify-center h-32 mt-4 pb-4">
      <div className="text-gray-500">아직 받은 평가가 없습니다</div>
      <div className="text-sm text-gray-400">
        팀원들이 평가를 완료하면 여기에 표시됩니다
      </div>
    </div>
  </div>
);

// const calculateTotalScore = (ratings: RatingItem[]): string => {
//   if (ratings.length === 0) return "0.0";

//   const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
//   return sum.toFixed(1);
// };

const mapRatingsData = (
  averageRatings: Props["ratingsData"]["averageRatings"]
): RatingItem[] => {
  return RATING_CONFIG.map((config) => ({
    key: config.key,
    label: config.label,
    abbr: config.abbr,
    value: averageRatings[config.key as keyof typeof averageRatings] || 0,
    maxValue: 5,
  }));
};

export default function PlayerRatingRadarChart({ ratingsData }: Props) {
  if (!ratingsData.hasRatings) {
    return <NoRatingsMessage />;
  }

  const { averageRatings, totalRatings } = ratingsData;
  const ratings = mapRatingsData(averageRatings);
  // const totalScore = calculateTotalScore(ratings);

  return (
    <div className="mx-4 border rounded-2xl overflow-hidden flex flex-col">
      <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-b gap-3 sm:gap-0 bg-neutral-50">
        <div className="flex items-center space-x-3">
          <UserRoundSearch className="size-5 text-gray-600" />
          <div className="flex items-center gap-1.5">
            <span className="font-medium">분석</span>
            <span className="font-medium text-sm text-gray-600">팀원 평가</span>
            <span className="text-sm font-semibold text-amber-600">
              {totalRatings}
            </span>
          </div>
        </div>
        {/* <span className="text-base font-medium text-gray-500">
          {totalScore}
        </span> */}
      </div>

      <div className="grid sm:grid-cols-2 sm:gap-4 items-center">
        {/* 레이더 차트 */}
        <div className="py-3 hidden sm:block bg-gradient-to-b from-transparent to-neutral-100">
          <RadarChart ratings={ratings} />
        </div>
        <div className="py-3 sm:hidden bg-gradient-to-b from-transparent to-neutral-100">
          <RadarChart ratings={ratings} isMobile />
        </div>

        {/* 상세 수치 */}
        <div className="flex flex-col gap-1.5 sm:border-t sm:border-none py-6 sm:py-4 my-auto">
          {ratings.map((rating) => {
            const colors = getColorByScore(rating.value);

            return (
              <div
                key={rating.key}
                className="flex justify-between items-center px-4 sm:text-sm gap-3"
              >
                <div className="min-w-24 flex items-center gap-2">
                  <span className="font-semibold w-12 sm:w-10">
                    {rating.label}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {rating.abbr}
                  </span>
                </div>
                <div className="flex items-center gap-3 grow">
                  <div className="bg-gray-100 h-1 w-full">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${rating.value * 20}%`,
                        // backgroundColor: colors.bg,
                      }}
                    />
                  </div>
                  <div
                    className="font-bold px-2 py-1 rounded-md w-10 text-center"
                    style={{
                      backgroundColor: colors.bgWithOpacity,
                      color: colors.text,
                    }}
                  >
                    {rating.value.toFixed(1)}
                  </div>
                </div>
              </div>
            );
          })}
          {/* <div className="text-sm text-gray-500 text-center flex items-center justify-center bg-gray-50 px-4 py-2 mx-4 rounded">
            {totalRatings}명의 팀원이 평가
          </div> */}
        </div>
      </div>
    </div>
  );
}
