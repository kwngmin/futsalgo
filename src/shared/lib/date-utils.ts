/**
 * @param date YYYY-MM-DD 형식의 날짜 문자열 또는 Date 객체
 * @returns D-day 숫자 (예: D-3이면 3, 오늘이면 0, 지났으면 음수)
 */
export function calculateDday(date: Date | string): number {
  const today = new Date();
  const targetDate = new Date(date);

  // 시차 보정: 시간을 00:00:00으로 맞춰줌 (UTC 문제 방지)
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 디데이를 한국어 형식으로 포맷팅
 * @param dday 디데이 숫자
 * @returns 포맷팅된 디데이 문자열
 */
export function formatDday(dday: number): string {
  if (dday === 0) {
    return "오늘";
  } else if (dday > 0) {
    return `D-${dday}`;
  } else {
    return `${Math.abs(dday)}일 전`;
  }
}
