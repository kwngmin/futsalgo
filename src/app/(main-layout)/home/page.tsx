"use client";

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/shared/components/ui/popover";
// import { Plus } from "lucide-react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();
  const session = useSession();
  console.log(session, "session");

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-6 h-16 shrink-0">
        <h1 className="text-2xl font-bold">홈</h1>
        <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
          {/* <Search className="w-5 h-5" /> */}
        </button>
      </div>
      {/* MatchesPage */}
      <div className="px-3 space-y-3">
        {session.data && (
          <div className="text-center py-8 bg-gray-200 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900">
              {/* 원활한 서비스 이용을 위해 로그인이 필요합니다 */}
            </h3>
            <div className="flex gap-2 justify-center">
              {/* <div className="flex gap-2 justify-center mt-3"> */}
              <button
                className="text-base bg-black text-white px-6 min-w-28 py-1.5 rounded-full font-bold cursor-pointer"
                onClick={() => router.push("/new")}
              >
                일정 추가
              </button>
            </div>
          </div>
        )}
      </div>
      {/* <Popover>
        <PopoverTrigger className="fixed bottom-20 lg:bottom-6 right-6 flex items-center justify-center bg-indigo-500 rounded-full">
          <div className="size-14 flex items-center justify-center bg-indigo-500 rounded-full">
            <Plus className="size-6 text-white" />
          </div>
          <span className="hidden lg:flex text-white">일정</span>
        </PopoverTrigger>
        <PopoverContent>Place content for the popover here.</PopoverContent>
      </Popover> */}
    </div>
  );
};

export default HomePage;
