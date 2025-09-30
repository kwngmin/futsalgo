// app/test/page.tsx
"use client";

import { useSession } from "next-auth/react";

export default function TestPage() {
  const { data: session, status } = useSession();

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <h1 className="text-2xl font-bold h-16 flex items-center">세션 테스트</h1>
      <div className="space-y-2">
        <p>상태: {status}</p>
        <p>로그인: {session?.user ? "예" : "아니오"}</p>
        <p>온보딩 단계: {session?.user?.onboardingStep || "없음"}</p>
      </div>
      <pre className="mt-4 p-4 bg-gray-100 rounded overflow-hidden whitespace-pre-wrap">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}
