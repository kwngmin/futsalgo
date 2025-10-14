import type { Metadata } from "next";
import { Suspense } from "react";
import BoardList from "./ui/BoardList";
import BoardHeader from "./ui/BoardHeader";

export const metadata: Metadata = {
  title: "게시판",
  description:
    "풋살 커뮤니티 게시판에서 다양한 정보를 공유하고 소통하세요. 경기 후기, 팀 모집, 풋살 팁 등을 자유롭게 이야기할 수 있습니다.",
  keywords: [
    "풋살 게시판",
    "풋살 커뮤니티",
    "풋살 후기",
    "풋살 팀 모집",
    "풋살 팁",
    "풋살 정보",
  ],
  openGraph: {
    title: "Futsalgo 게시판 - 풋살 커뮤니티",
    description:
      "풋살 커뮤니티 게시판에서 다양한 정보를 공유하고 소통하세요. 경기 후기, 팀 모집, 풋살 팁 등을 자유롭게 이야기할 수 있습니다.",
    url: "https://futsalgo.com/boards",
  },
  twitter: {
    title: "Futsalgo 게시판 - 풋살 커뮤니티",
    description:
      "풋살 커뮤니티 게시판에서 다양한 정보를 공유하고 소통하세요. 경기 후기, 팀 모집, 풋살 팁 등을 자유롭게 이야기할 수 있습니다.",
  },
};

/**
 * 게시판 메인 페이지
 * @returns 게시판 목록 페이지
 */
const BoardsPage = () => {
  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <BoardHeader />
      <Suspense fallback={<div className="p-4">로딩 중...</div>}>
        <BoardList />
      </Suspense>
    </div>
  );
};

export default BoardsPage;
