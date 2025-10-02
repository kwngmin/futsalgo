"use server";

interface AccessTokenApiResponse {
  result: {
    accessToken: string;
    accessTimeout: string;
  };
  errCd: number;
  errMsg: string;
  id: string;
  trId: string;
}

export async function getAccessToken(): Promise<AccessTokenApiResponse> {
  const consumerKey = process.env.CONSUMER_KEY;
  const consumerSecret = process.env.CONSUMER_SECRET;
  const baseUrl = process.env.SGIS_BASE_URL;

  if (!consumerKey || !consumerSecret || !baseUrl) {
    throw new Error(
      "필수 환경변수가 설정되지 않았습니다 (CONSUMER_KEY, CONSUMER_SECRET, SGIS_BASE_URL)"
    );
  }

  const queryString = new URLSearchParams({
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
  }).toString();

  const url = `${baseUrl}/OpenAPI3/auth/authentication.json?${queryString}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // 토큰은 캐싱하지 않음 (매번 새로 발급)
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: 액세스 토큰 발급에 실패했습니다`
      );
    }

    const data: AccessTokenApiResponse = await response.json();

    // API 응답 에러 체크
    if (data.errCd !== 0) {
      throw new Error(`API Error ${data.errCd}: ${data.errMsg}`);
    }

    console.log(`새 액세스 토큰 발급 완료: ${data.result.accessToken}`);
    return data;
  } catch (error) {
    console.error("액세스 토큰 발급 실패:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("액세스 토큰을 발급받는 중 알 수 없는 오류가 발생했습니다");
  }
}
