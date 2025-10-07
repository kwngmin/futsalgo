import { Suspense } from "react";
import PostEdit from "./ui/PostEdit";
import PostEditHeader from "./ui/PostEditHeader";

interface PostEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 게시글 수정 페이지
 * @param params - 라우트 파라미터
 * @returns 게시글 수정 페이지
 */
const PostEditPage = async ({ params }: PostEditPageProps) => {
  const { id } = await params;

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <PostEditHeader />
      <Suspense fallback={<div className="p-4">로딩 중...</div>}>
        <PostEdit postId={id} />
      </Suspense>
    </div>
  );
};

export default PostEditPage;
