/**
 * API 요청을 위한 유틸리티 함수들
 */

/**
 * 안전한 JSON 직렬화를 수행합니다.
 * 순환 참조나 특수 값들을 처리합니다.
 *
 * @param data - 직렬화할 데이터
 * @returns 직렬화된 JSON 문자열
 * @throws Error 직렬화에 실패한 경우
 */
export function safeJsonStringify(data: unknown): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error("JSON 직렬화 실패:", error);
    throw new Error(
      `데이터 직렬화에 실패했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
}

/**
 * HTTP 요청을 위한 표준 헤더를 생성합니다.
 *
 * @returns 표준 HTTP 헤더 객체
 */
export function createStandardHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
  };
}

/**
 * API 요청을 위한 표준 fetch 옵션을 생성합니다.
 *
 * @param method - HTTP 메서드
 * @param body - 요청 본문 (선택사항)
 * @returns fetch 옵션 객체
 */
export function createApiRequestOptions(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  body?: unknown
): RequestInit {
  const options: RequestInit = {
    method,
    headers: createStandardHeaders(),
  };

  if (body !== undefined) {
    options.body = safeJsonStringify(body);
  }

  return options;
}

/**
 * API 응답을 안전하게 파싱합니다.
 *
 * @param response - fetch 응답 객체
 * @returns 파싱된 JSON 데이터
 * @throws Error 파싱에 실패한 경우
 */
export async function safeJsonParse<T = unknown>(
  response: Response
): Promise<T> {
  try {
    const text = await response.text();
    if (!text) {
      throw new Error("응답이 비어있습니다");
    }
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("JSON 파싱 실패:", error);
    throw new Error(
      `응답 파싱에 실패했습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
}
