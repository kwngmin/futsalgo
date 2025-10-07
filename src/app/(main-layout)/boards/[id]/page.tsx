import { Suspense } from "react";
import PostDetail from "./ui/PostDetail";
import PostHeader from "./ui/PostHeader";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 게시글 상세보기 페이지
 * @param params - 라우트 파라미터
 * @returns 게시글 상세보기 페이지
 */
const PostPage = async ({ params }: PostPageProps) => {
  const { id } = await params;

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <PostHeader />
      <Suspense fallback={<div className="p-4">로딩 중...</div>}>
        <PostDetail postId={id} />
      </Suspense>
    </div>
  );
};

export default PostPage;
