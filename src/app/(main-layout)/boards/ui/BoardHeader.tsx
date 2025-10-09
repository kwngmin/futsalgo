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
      <h1 className="text-[1.625rem] font-bold">게시판</h1>
      <Link
        href={session ? "/boards/write" : "/login"}
        className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      >
        <Plus
          className="size-6"
          // strokeWidth={1.75}
        />
      </Link>
    </div>
  );
};

export default BoardHeader;
