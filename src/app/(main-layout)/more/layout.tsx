import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "더보기",
  description:
    "Futsalgo 서비스 설정, 프로필 관리, 제안하기, 버그 신고 등 다양한 기능을 이용할 수 있습니다.",
  keywords: [
    "풋살 설정",
    "풋살 프로필",
    "풋살 제안",
    "풋살 버그 신고",
    "풋살 이용약관",
    "풋살 개인정보처리방침",
  ],
  openGraph: {
    title: "Futsalgo 더보기 - 서비스 설정",
    description:
      "Futsalgo 서비스 설정, 프로필 관리, 제안하기, 버그 신고 등 다양한 기능을 이용할 수 있습니다.",
    url: "https://futsalgo.com/more",
  },
  twitter: {
    title: "Futsalgo 더보기 - 서비스 설정",
    description:
      "Futsalgo 서비스 설정, 프로필 관리, 제안하기, 버그 신고 등 다양한 기능을 이용할 수 있습니다.",
  },
};

export default function MoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
