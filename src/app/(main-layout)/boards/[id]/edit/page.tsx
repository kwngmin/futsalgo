import PostEdit from "./ui/PostEdit";
import PostEditHeader from "./ui/PostEditHeader";
import { getPost } from "@/app/(main-layout)/boards/actions/get-post";

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

  // 서버에서 초기 데이터 가져오기
  const initialData = await getPost(id);

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <PostEditHeader />
      <PostEdit
        postId={id}
        initialData={initialData.success ? initialData.data : undefined}
      />
    </div>
  );
};

export default PostEditPage;
