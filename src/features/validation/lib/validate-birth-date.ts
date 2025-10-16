/**
 * 생년월일 유효성 검증 함수
 * @param birthDate 8자리 생년월일 문자열 (예: "19850101")
 * @returns 유효한 생년월일인지 여부
 */
export function validateBirthDate(birthDate: string): boolean {
  // 8자리 숫자인지 확인
  if (!/^\d{8}$/.test(birthDate)) {
    return false;
  }

  const year = parseInt(birthDate.substring(0, 4));
  const month = parseInt(birthDate.substring(4, 6));
  const day = parseInt(birthDate.substring(6, 8));

  // 년도 범위 확인 (1900년 ~ 현재년도)
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return false;
  }

  // 월 범위 확인
  if (month < 1 || month > 12) {
    return false;
  }

  // 일 범위 확인
  if (day < 1 || day > 31) {
    return false;
  }

  // 실제 날짜 유효성 확인
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
