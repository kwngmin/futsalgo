import { Suspense } from "react";
import BoardList from "./ui/BoardList";
import BoardHeader from "./ui/BoardHeader";

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
