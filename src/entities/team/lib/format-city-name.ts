/**
 * @param city 전체 시/도 이름 (예: '서울특별시', '충청북도')
 * @returns 축약된 지역명 (예: '서울', '충북')
 */
export function formatCityName(city: string): string {
  const cityMap: Record<string, string> = {
    서울특별시: "서울",
    부산광역시: "부산",
    대구광역시: "대구",
    인천광역시: "인천",
    광주광역시: "광주",
    대전광역시: "대전",
    울산광역시: "울산",
    세종특별자치시: "세종",
    경기도: "경기",
    강원도: "강원",
    충청북도: "충북",
    충청남도: "충남",
    전라북도: "전북",
    전라남도: "전남",
    경상북도: "경북",
    경상남도: "경남",
    제주특별자치도: "제주",
  };

  return cityMap[city] ?? city;
}
