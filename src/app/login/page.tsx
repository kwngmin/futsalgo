"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { AuthButton } from "./ui/AuthButton";
import { AUTH_PROVIDERS, ProviderId } from "@/shared/config/provider-config";

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
      <div className="w-full max-w-sm">
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
