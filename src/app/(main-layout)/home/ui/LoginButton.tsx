"use client";

import { ChevronRight, CircleUserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setIsLoading(true);
        router.push("/login");
      }}
      disabled={isLoading}
      className="fixed bottom-28 md:left-20 lg:left-72 md:bottom-0 left-0 right-0 sm:max-w-xs md:max-w-2xl mx-4 sm:mx-auto shrink-0 h-12 sm:h-11 flex items-center justify-between bg-gray-900 text-white hover:bg-gray-800 rounded-full md:rounded-b-none md:rounded-t-2xl cursor-pointer font-semibold z-20 px-3 active:bg-gray-700 active:scale-98 transition-all shadow-md inset-shadow-sm inset-shadow-white/50 disabled:bg-gray-600 disabled:cursor-default"
      aria-label="로그인"
    >
      <div className="flex items-center justify-center gap-3 sm:gap-2.5">
        <div className="shrink-0 size-7 sm:size-6 flex items-center justify-center bg-white text-gray-700 rounded-full">
          <CircleUserRound className="size-5" strokeWidth={2.5} />
        </div>
        <span className="md:text-sm font-semibold">
          {isLoading ? "로그인 페이지로 이동 중..." : "로그인"}
        </span>
      </div>
      <ChevronRight className="size-6 opacity-80" strokeWidth={1.5} />
    </button>
  );
};

export default LoginButton;
