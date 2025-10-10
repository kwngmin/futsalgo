/**
 * Query key 생성을 위한 유틸리티 함수들
 */

/**
 * 객체를 안정적인 문자열 키로 변환합니다.
 * JSON.stringify보다 더 안정적이고 읽기 쉬운 키를 생성합니다.
 *
 * @param obj - 변환할 객체
 * @returns 안정적인 문자열 키
 */
export function createStableKey(obj: Record<string, unknown>): string {
  if (!obj || Object.keys(obj).length === 0) {
    return "";
  }

  // 객체의 키를 정렬하여 일관된 키 생성
  const sortedEntries = Object.entries(obj)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`);

  return sortedEntries.join("|");
}

/**
 * Query key 배열을 생성합니다.
 *
 * @param baseKeys - 기본 키들
 * @param filters - 필터 객체 (선택사항)
 * @returns Query key 배열
 */
export function createQueryKey(
  baseKeys: string[],
  filters?: Record<string, unknown>
): string[] {
  if (!filters || Object.keys(filters).length === 0) {
    return baseKeys;
  }

  const filterKey = createStableKey(filters);
  return filterKey ? [...baseKeys, filterKey] : baseKeys;
}

/**
 * 특정 패턴의 query key를 생성합니다.
 *
 * @param entity - 엔티티 이름 (예: 'players', 'teams')
 * @param type - 타입 (예: 'all', 'following')
 * @param filters - 필터 객체 (선택사항)
 * @returns Query key 배열
 */
export function createEntityQueryKey(
  entity: string,
  type: string,
  filters?: Record<string, unknown>
): string[] {
  return createQueryKey([entity, type], filters);
}
