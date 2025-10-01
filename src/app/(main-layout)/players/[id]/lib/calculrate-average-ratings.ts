interface RatingValues {
  shooting: number;
  passing: number;
  stamina: number;
  physical: number;
  dribbling: number;
  defense: number;
}

interface RatingsData {
  totalRatings: RatingValues;
  raterCount: number;
  hasRatings: boolean;
}

interface CalculateAverageRatingsProps {
  selfRatings: RatingValues;
  ratingsData: RatingsData;
}

export function calculateAverageRatings({
  selfRatings,
  ratingsData,
}: CalculateAverageRatingsProps): RatingValues {
  // 평가 데이터가 없으면 본인 평가를 그대로 반환
  if (!ratingsData.hasRatings) {
    return selfRatings;
  }

  const ratingKeys: (keyof RatingValues)[] = [
    "shooting",
    "passing",
    "stamina",
    "physical",
    "dribbling",
    "defense",
  ];

  // totalRatings + selfRatings를 합산하고 (raterCount + 1)로 나눠 평균 계산
  const averageRatings: RatingValues = Object.fromEntries(
    ratingKeys.map((key) => [
      key,
      (ratingsData.totalRatings[key] + selfRatings[key]) /
        (ratingsData.raterCount + 1),
    ])
  ) as unknown as RatingValues;

  return averageRatings;
}
