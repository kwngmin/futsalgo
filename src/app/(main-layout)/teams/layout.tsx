import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "팀",
  description:
    "풋살 팀을 찾아보고 새로운 팀에 참여하세요. 지역, 실력, 모집 여부 등 다양한 조건으로 팀을 검색할 수 있습니다.",
  keywords: [
    "풋살 팀",
    "풋살 팀 찾기",
    "풋살 팀 가입",
    "풋살 팀 모집",
    "풋살 커뮤니티",
    "풋살 팀 매칭",
  ],
  openGraph: {
    title: "Futsalgo 팀 - 풋살 팀 찾기",
    description:
      "풋살 팀을 찾아보고 새로운 팀에 참여하세요. 지역, 실력, 모집 여부 등 다양한 조건으로 팀을 검색할 수 있습니다.",
    url: "https://futsalgo.com/teams",
  },
  twitter: {
    title: "Futsalgo 팀 - 풋살 팀 찾기",
    description:
      "풋살 팀을 찾아보고 새로운 팀에 참여하세요. 지역, 실력, 모집 여부 등 다양한 조건으로 팀을 검색할 수 있습니다.",
  },
};

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
