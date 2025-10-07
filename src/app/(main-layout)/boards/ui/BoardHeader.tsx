"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * 게시판 헤더 컴포넌트
 * @returns 게시판 헤더
 */
const BoardHeader = () => {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-between px-4 h-16 shrink-0">
      <h1 className="text-[1.625rem] font-bold">자유게시판</h1>
      {session ? (
        <Link
          href="/boards/write"
          className="shrink-0 size-10 flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors cursor-pointer"
        >
          <Plus className="size-5" />
        </Link>
      ) : (
        <div className="text-sm text-gray-500">
          글쓰기는 로그인이 필요합니다
        </div>
      )}
    </div>
  );
};

export default BoardHeader;
