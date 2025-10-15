// features/user/components/withdraw-section.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { withdrawUser } from "./model/actions/withdrawal";
import { requireAuth } from "@/shared/lib/auth-utils";

export default function WithdrawPage() {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleWithdraw = async () => {
    const userId = await requireAuth();
    if (!userId) {
      return;
    }

    if (
      !confirm(
        "정말로 탈퇴하시겠습니까?\n\n탈퇴 시 다음 정보가 삭제됩니다:\n- 개인정보 (이메일, 전화번호, 프로필)\n- 팔로우/팔로잉 관계\n\n단, 팀 활동 기록은 통계를 위해 보존됩니다."
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await withdrawUser(userId.id, reason);

      if (!response.success) {
        alert(response.error || "탈퇴 처리에 실패했습니다.");
        return;
      }

      alert("회원 탈퇴가 완료되었습니다.\n그동안 이용해주셔서 감사합니다.");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("탈퇴 오류:", error);
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-white to-gray-50 px-4 pt-20">
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-semibold text-red-600 mb-2">계정 탈퇴</h2>
        <p className="text-gray-600 text-sm mb-4">
          탈퇴 시 개인정보는 즉시 삭제되며, 같은 이메일/전화번호로 재가입이
          가능합니다.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            탈퇴 사유 (선택)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="서비스 개선을 위해 탈퇴 사유를 알려주세요."
            className="w-full border rounded-lg p-2 text-sm mb-4 bg-white resize-none"
            rows={3}
          />

          <div className="flex gap-2">
            <button
              onClick={handleWithdraw}
              disabled={isLoading}
              className="bg-red-600 text-white px-4 py-2 rounded-sm text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium active:scale-95"
            >
              {isLoading ? "처리 중..." : "탈퇴하기"}
            </button>
            <Link
              href="/more/profile"
              className={`bg-gray-200 text-gray-700 px-4 py-2 rounded-sm text-sm hover:bg-gray-300 font-medium active:scale-95 ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              취소
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
