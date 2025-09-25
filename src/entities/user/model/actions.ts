/**
 * 8자리 생년월일 문자열을 받아서 만나이를 계산하는 함수
 * @param birthDate - YYYYMMDD 형식의 8자리 문자열 (예: "19860911")
 * @returns 만나이 (숫자)
 * @throws Error - 유효하지 않은 형식이거나 날짜인 경우
 */
export const calculateAge = (birthDate: string): number => {
  // 입력 검증
  if (!birthDate || typeof birthDate !== "string") {
    throw new Error("생년월일을 입력해주세요");
  }

  // 8자리 숫자 형식 검증
  if (!/^\d{8}$/.test(birthDate)) {
    throw new Error("생년월일은 8자리 숫자여야 합니다 (예: 19860911)");
  }

  // 년, 월, 일 추출
  const year = parseInt(birthDate.substring(0, 4));
  const month = parseInt(birthDate.substring(4, 6));
  const day = parseInt(birthDate.substring(6, 8));

  // 날짜 유효성 검증
  const birth = new Date(year, month - 1, day);
  if (
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  ) {
    throw new Error("유효하지 않은 날짜입니다");
  }

  // 미래 날짜 검증
  const today = new Date();
  if (birth > today) {
    throw new Error("생년월일은 현재 날짜보다 이전이어야 합니다");
  }

  // 만나이 계산
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let age = currentYear - year;

  // 생일이 아직 지나지 않았으면 나이에서 1을 뺀다
  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--;
  }

  return age;
};

// 현재 날짜 기준으로 나이 계산 예시
export const getCurrentAge = (
  birthDate: string
): { success: boolean; age?: number } => {
  try {
    const age = calculateAge(birthDate);
    return { success: true, age };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

/**
 * 전화번호 문자열을 포맷팅해서 반환하는 함수
 * @param input 숫자로 이루어진 문자열 (ex: "01012345678")
 * @returns 포맷팅된 전화번호 문자열 (ex: "010-1234-5678")
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // 입력값이 문자열이 아니거나 빈 문자열인 경우 그대로 반환
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return phoneNumber;
  }

  // 숫자만 추출
  const numbersOnly = phoneNumber.replace(/\D/g, "");

  // "10"으로 시작하면 "010"으로 변환
  const digits = numbersOnly.startsWith("10") ? "0" + numbersOnly : numbersOnly;

  // "010"으로 시작하지 않으면 그대로 반환
  if (!digits.startsWith("010")) {
    return phoneNumber;
  }

  if (digits.length === 10) {
    // 000-000-0000
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11) {
    // 000-0000-0000
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  // 기본적으로 원본 반환
  return phoneNumber;
};

/**
 * 이름의 첫 글자만 남기고 나머지는 *로 마스킹 처리함
 * @param name 마스킹할 이름
 * @returns 첫 글자 + *로 마스킹된 문자열
 */
export function maskName(name: string): string {
  if (!name) return "";

  const firstChar = name.charAt(0);
  const mask = "*".repeat(name.length - 1);

  return `${firstChar}${mask}`;
}
