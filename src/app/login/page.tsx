"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { AuthButton } from "./ui/AuthButton";

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
  {
    id: "naver",
    name: "네이버",
    symbol: "/assets/logos/naver-symbol-w.svg",
    containerColor: "#03C75A",
    lableColor: "#ffffff",
  },
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

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<ProviderId | null>(null);

  const handleLogin = async (providerId: ProviderId) => {
    try {
      setIsLoading(providerId);
      await signIn(providerId, {
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("로그인 오류:", error);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 px-4 pt-20">
      <div className="w-full max-w-md">
        {/* 로고/타이틀 영역 */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Futsalgo</h1>
          <p className="text-gray-600">
            당신의 풋살 기록, 매칭, 커뮤니티 플랫폼
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-lg shadow-lg shadow-gray-100 p-6">
          {/* Provider 버튼 리스트 */}
          <div className="space-y-3">
            {AUTH_PROVIDERS.map((provider) => (
              <AuthButton
                key={provider.id}
                providerName={provider.name}
                symbol={provider.symbol}
                containerColor={provider.containerColor}
                lableColor={provider.lableColor}
                onClick={() => handleLogin(provider.id)}
                isLoading={isLoading === provider.id}
                disabled={isLoading !== null}
              />
            ))}
          </div>
        </div>

        {/* 하단 정보 */}
        <p className="mt-6 text-center text-sm text-gray-500 break-keep leading-normal px-4">
          계속하면 Futsalgo의{" "}
          <a href="/terms" className="font-semibold text-gray-900">
            이용 약관
          </a>{" "}
          및{" "}
          <a href="/privacy" className="font-semibold text-gray-900">
            개인정보처리방침
          </a>
          에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
