"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * 게시글 수정 헤더 컴포넌트
 * @returns 게시글 수정 헤더
 */
const PostEditHeader = () => {
  const router = useRouter();

  return (
    <div className="flex items-center px-4 h-16 shrink-0">
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-5" />
        <span>뒤로</span>
      </button>
    </div>
  );
};

export default PostEditHeader;
