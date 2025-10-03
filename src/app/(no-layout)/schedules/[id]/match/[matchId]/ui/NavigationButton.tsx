"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const Icon = isPrev ? ChevronLeft : ChevronRight;
  // const label = isPrev ? "이전" : "다음";

  return (
    <button
      className={`shrink-0 size-10 flex items-center font-semibold justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors ${
        disabled
          ? "bg-gray-200 opacity-40 cursor-default pointer-events-none"
          : "cursor-pointer"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {isPrev ? (
        <>
          <Icon
            className="size-6.5 mr-0.5"
            // strokeWidth={1.75}
          />
          {/* {label} */}
        </>
      ) : (
        <>
          {/* {label} */}
          <Icon
            className="size-6.5 ml-0.5"
            // strokeWidth={1.75}
          />
        </>
      )}
    </button>
  );
};
