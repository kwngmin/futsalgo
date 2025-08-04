"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

// 네비게이션 버튼 컴포넌트 (DRY 원칙 적용)
interface NavigationButtonProps {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}

export const NavigationButton = ({
  direction,
  disabled,
  onClick,
}: NavigationButtonProps) => {
  const isPrev = direction === "prev";
  const Icon = isPrev ? ChevronUp : ChevronDown;
  const label = isPrev ? "이전" : "다음";

  return (
    <button
      className={`shrink-0 px-3 h-10 flex items-center gap-1.5 font-medium justify-center text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors ${
        disabled
          ? "opacity-50 cursor-default pointer-events-none"
          : "cursor-pointer"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="size-5" strokeWidth={2.5} />
      {label}
    </button>
  );
};
