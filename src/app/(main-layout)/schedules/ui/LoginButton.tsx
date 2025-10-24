"use client";

import { ChevronRight, CircleUserRound } from "lucide-react";
import Link from "next/link";

const LoginButton = () => {
  return (
    <Link
      href="/login"
      className="fixed bottom-28 md:left-20 lg:left-64 md:bottom-0 left-0 right-0 sm:max-w-xs md:max-w-2xl mx-4 sm:mx-auto shrink-0 h-12 flex items-center justify-between bg-gray-900 text-white hover:bg-gray-800 rounded-full md:rounded-b-none md:rounded-t-2xl font-semibold z-20 px-3 active:bg-gray-700 active:scale-98 md:active:scale-100 transition-all shadow-md inset-shadow-sm inset-shadow-white/50 cursor-pointer"
      aria-label="로그인"
    >
      <div className="flex items-center justify-center gap-3">
        <div className="shrink-0 size-7 flex items-center justify-center bg-white text-gray-700 rounded-full">
          <CircleUserRound className="size-5" strokeWidth={2.5} />
        </div>
        <span className="font-semibold">로그인</span>
      </div>
      <ChevronRight className="size-6 opacity-80" strokeWidth={1.5} />
    </Link>
  );
};

export default LoginButton;
