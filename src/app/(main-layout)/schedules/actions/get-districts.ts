"use server";

interface DistrictsApiResponse {
  result: Array<{
    cd: string;
    addr_name: string;
  }>;
  errCd: number;
  errMsg: string;
  id: string;
  trId: string;
}

export async function getDistricts(
  accessToken: string,
  cd: string
): Promise<DistrictsApiResponse> {
  const baseUrl = process.env.SGIS_BASE_URL;

  if (!baseUrl) {
    throw new Error("SGIS_BASE_URL 환경변수가 설정되지 않았습니다");
  }

  const queryString = new URLSearchParams({
    accessToken,
    cd,
  }).toString();

  const url = `${baseUrl}/OpenAPI3/addr/stage.json?${queryString}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // 캐시 설정 추가
      next: {
        revalidate: 3600, // 1시간 캐시
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("401: 액세스 토큰이 만료되었거나 유효하지 않습니다");
      }
      throw new Error(
        `HTTP ${response.status}: 시군구 정보를 가져올 수 없습니다`
      );
    }

    const data: DistrictsApiResponse = await response.json();

    // API 응답 에러 체크
    if (data.errCd !== 0) {
      throw new Error(`API Error ${data.errCd}: ${data.errMsg}`);
    }

    return data;
  } catch (error) {
    console.error("시군구 정보 조회 실패:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("시군구 정보를 가져오는 중 알 수 없는 오류가 발생했습니다");
  }
}
