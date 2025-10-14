import type { Metadata } from "next";
import LoginPageClient from "./ui/LoginPageClient";

export const metadata: Metadata = {
  title: "로그인",
  description:
    "Futsalgo에 로그인하여 풋살 일정 관리, 팀 매칭, 경기 기록 등 다양한 서비스를 이용하세요.",
  keywords: [
    "풋살 로그인",
    "풋살 회원가입",
    "풋살 소셜로그인",
    "풋살 계정",
    "풋살 서비스",
  ],
  openGraph: {
    title: "Futsalgo 로그인 - 풋살 플랫폼",
    description:
      "Futsalgo에 로그인하여 풋살 일정 관리, 팀 매칭, 경기 기록 등 다양한 서비스를 이용하세요.",
    url: "https://futsalgo.com/login",
  },
  twitter: {
    title: "Futsalgo 로그인 - 풋살 플랫폼",
    description:
      "Futsalgo에 로그인하여 풋살 일정 관리, 팀 매칭, 경기 기록 등 다양한 서비스를 이용하세요.",
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
