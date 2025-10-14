import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원",
  description:
    "풋살 회원들을 찾아보고 새로운 팀원을 만나보세요. 실력, 지역, 나이 등 다양한 조건으로 회원을 검색할 수 있습니다.",
  keywords: [
    "풋살 회원",
    "풋살 팀원",
    "풋살 선수",
    "풋살 매칭",
    "풋살 커뮤니티",
    "풋살 플레이어",
  ],
  openGraph: {
    title: "Futsalgo 회원 - 풋살 팀원 찾기",
    description:
      "풋살 회원들을 찾아보고 새로운 팀원을 만나보세요. 실력, 지역, 나이 등 다양한 조건으로 회원을 검색할 수 있습니다.",
    url: "https://futsalgo.com/players",
  },
  twitter: {
    title: "Futsalgo 회원 - 풋살 팀원 찾기",
    description:
      "풋살 회원들을 찾아보고 새로운 팀원을 만나보세요. 실력, 지역, 나이 등 다양한 조건으로 회원을 검색할 수 있습니다.",
  },
};

export default function PlayersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
