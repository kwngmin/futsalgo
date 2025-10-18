import type { Metadata } from "next";
import PostDetail from "./ui/PostDetail";
import PostHeader from "./ui/PostHeader";
import { getPost } from "../actions/get-post";

/**
 * 게시글 페이지 메타데이터 생성
 * @param params - URL 파라미터
 * @returns 메타데이터 객체
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "게시글",
    description: `풋살 커뮤니티 게시글을 확인하고 댓글로 소통하세요. 경기 후기, 팀 모집, 풋살 팁 등 다양한 정보를 공유할 수 있습니다.`,
    keywords: [
      "풋살 게시글",
      "풋살 커뮤니티",
      "풋살 후기",
      "풋살 팀 모집",
      "풋살 팁",
      "풋살 정보",
    ],
    openGraph: {
      title: "Futsalgo 게시글 - 풋살 커뮤니티",
      description: `풋살 커뮤니티 게시글을 확인하고 댓글로 소통하세요. 경기 후기, 팀 모집, 풋살 팁 등 다양한 정보를 공유할 수 있습니다.`,
      url: `https://futsalgo.com/boards/${id}`,
    },
    twitter: {
      title: "Futsalgo 게시글 - 풋살 커뮤니티",
      description: `풋살 커뮤니티 게시글을 확인하고 댓글로 소통하세요. 경기 후기, 팀 모집, 풋살 팁 등 다양한 정보를 공유할 수 있습니다.`,
    },
  };
}

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

  // 서버에서 초기 데이터 가져오기
  const initialData = await getPost(id);

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <PostHeader id={id} />
      <PostDetail
        postId={id}
        initialData={initialData.success ? initialData.data : undefined}
      />
    </div>
  );
};

export default PostPage;
