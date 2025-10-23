import type { Metadata } from "next";
import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "./ui/OnboardingFlow";

export const metadata: Metadata = {
  title: "온보딩",
  description:
    "Futsalgo 서비스 이용을 위한 기본 정보를 설정하세요. 프로필, 닉네임, 연락처 등을 입력하여 완전한 풋살 경험을 시작하세요.",
  keywords: [
    "풋살 온보딩",
    "풋살 프로필 설정",
    "풋살 회원가입",
    "풋살 초기 설정",
    "풋살 서비스 시작",
  ],
  openGraph: {
    title: "Futsalgo 온보딩 - 서비스 시작",
    description:
      "Futsalgo 서비스 이용을 위한 기본 정보를 설정하세요. 프로필, 닉네임, 연락처 등을 입력하여 완전한 풋살 경험을 시작하세요.",
    url: "https://futsalgo.com/onboarding",
  },
  twitter: {
    title: "Futsalgo 온보딩 - 서비스 시작",
    description:
      "Futsalgo 서비스 이용을 위한 기본 정보를 설정하세요. 프로필, 닉네임, 연락처 등을 입력하여 완전한 풋살 경험을 시작하세요.",
  },
};

const OnboardingPage = async () => {
  const session = await auth();
  console.log(session, "session");

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen sm:items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full sm:max-w-sm space-y-8 sm:mb-48">
        <div className="text-center">
          <h1 className="text-[1.625rem] font-bold text-gray-900">
            환영합니다!
          </h1>
          {/* <p className="mt-2 text-sm text-gray-600">
            서비스 이용을 위해 닉네임을 설정해주세요
          </p> */}
        </div>
        <OnboardingFlow />
      </div>
    </div>
  );
};

export default OnboardingPage;
