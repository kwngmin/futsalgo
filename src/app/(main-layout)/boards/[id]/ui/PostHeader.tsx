"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Share } from "lucide-react";

/**
 * 게시글 상세보기 헤더 컴포넌트
 * @returns 게시글 헤더
 */
const PostHeader = ({ id }: { id: string }) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-4 h-16 shrink-0">
      <button
        onClick={() => router.back()}
        className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      >
        <ArrowLeft className="size-6" />
      </button>
      <div className="flex items-center justify-end gap-1.5">
        {/* 좋아요 버튼 수정 */}
        {/* <button
          type="button"
          className={`shrink-0 h-9 px-4 gap-1.5 flex items-center justify-center rounded-full transition-colors cursor-pointer font-semibold ${
            isFollowing
              ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
              : "bg-neutral-100 hover:bg-neutral-200 text-gray-600 hover:text-gray-700"
          }`}
          onClick={() => handleFollowClick(id)}
        >
          {isFollowing ? "좋아요" : "좋아요"}
        </button> */}
        <button
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          type="button"
          onClick={async () => {
            console.log(process.env.NODE_ENV, "env");
            try {
              if (process.env.NODE_ENV === "development") {
                console.log("development");
                await navigator.clipboard.writeText(
                  `localhost:3000/boards/${id}`
                );
              } else {
                console.log("production");
                await navigator.clipboard.writeText(
                  `www.futsalgo.com/boards/${id}`
                );
              }
            } catch (error) {
              console.error(error, "error");
            } finally {
              alert("URL이 복사되었습니다.");
            }
          }}
        >
          <Share className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default PostHeader;
