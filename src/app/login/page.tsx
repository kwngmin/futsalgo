"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { AuthButton } from "./ui/AuthButton";
import { AUTH_PROVIDERS, ProviderId } from "@/shared/config/provider-config";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<ProviderId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "OAuthAccountNotLinked") {
      setError(
        "이미 다른 소셜 로그인으로 가입된 이메일입니다. 기존 계정으로 로그인해주세요."
      );
    } else if (errorParam) {
      setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }, [searchParams]);

  const handleLogin = async (providerId: ProviderId) => {
    try {
      setError(null); // 에러 메시지 초기화
      setIsLoading(providerId);
      await signIn(providerId, {
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("로그인 오류:", error);
      setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-white to-gray-50 px-4 pt-20">
      <div className="w-full max-w-sm">
        {/* 로고/타이틀 영역 */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-center mb-6 w-full cursor-pointer"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Futsalgo</h1>
          <p className="text-gray-600">
            당신의 풋살 기록, 매칭, 커뮤니티 플랫폼
          </p>
        </button>

        {/* 로그인 카드 */}
        <div className="bg-white border rounded-lg shadow-lg shadow-gray-100 p-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

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
        <p className="mt-6 text-center sm:text-sm text-gray-500 break-keep leading-normal px-4">
          계속하면 <span className="font-medium text-gray-600">Futsalgo</span>의{" "}
          <a href="/terms" className="font-medium text-gray-900">
            이용 약관
          </a>{" "}
          및{" "}
          <a href="/privacy" className="font-medium text-gray-900">
            개인정보처리방침
          </a>
          에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
