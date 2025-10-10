// Provider 설정 타입
export interface ProviderConfig {
  id: string;
  name: string;
  symbol: string;
  containerColor: string;
  lableColor: string;
}

// 현재 사용 중인 providers
export const AUTH_PROVIDERS: readonly ProviderConfig[] = [
  // {
  //   id: "naver",
  //   name: "네이버",
  //   symbol: "/assets/logos/naver-symbol-w.svg",
  //   containerColor: "#03C75A",
  //   lableColor: "#ffffff",
  // },
  {
    id: "kakao",
    name: "카카오",
    symbol: "/assets/logos/kakao-symbol.svg",
    containerColor: "#FEE500",
    lableColor: "#000000/85",
  },
  {
    id: "google",
    name: "구글",
    symbol: "/assets/logos/google-symbol.svg",
    containerColor: "#F2F2F2",
    lableColor: "#000000/85",
  },
] as const;

// Provider ID 타입
export type ProviderId = (typeof AUTH_PROVIDERS)[number]["id"];

// Provider 정보 조회 헬퍼 함수
export function getProviderById(id: ProviderId): ProviderConfig | undefined {
  return AUTH_PROVIDERS.find((provider) => provider.id === id);
}

// 모든 Provider ID 배열
export const PROVIDER_IDS = AUTH_PROVIDERS.map((p) => p.id) as ProviderId[];
