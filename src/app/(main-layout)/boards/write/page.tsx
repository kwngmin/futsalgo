import { Suspense } from "react";
import PostWrite from "./ui/PostWrite";
import PostWriteHeader from "./ui/PostWriteHeader";

/**
 * 게시글 작성 페이지
 * @returns 게시글 작성 페이지
 */
const PostWritePage = () => {
  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <PostWriteHeader />
      <Suspense fallback={<div className="p-4">로딩 중...</div>}>
        <PostWrite />
      </Suspense>
    </div>
  );
};

export default PostWritePage;
