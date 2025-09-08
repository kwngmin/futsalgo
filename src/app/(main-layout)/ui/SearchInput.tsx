// @/app/(main-layout)/home/components/SearchInput.tsx
"use client";

import React, { memo } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isMobile?: boolean;
}

// React.memo로 감싸서 props가 변경될 때만 리렌더링
const SearchInput = memo(
  ({ value, onChange, onClear, isMobile = false }: SearchInputProps) => {
    return (
      <div
        className={`${
          isMobile ? "grow shrink-0" : "w-72 shrink-0"
        } px-3 h-10 sm:h-9 ${
          isMobile ? "flex sm:hidden" : "hidden sm:flex"
        } items-center justify-center text-gray-600 hover:text-gray-900 rounded-md transition-colors gap-2 bg-gray-100 hover:bg-gray-200`}
      >
        <Search
          className={isMobile ? "size-5 shrink-0" : "size-4.5 shrink-0"}
        />
        <input
          className="grow sm:placeholder:text-sm placeholder:text-gray-500 h-full border-none focus:outline-none sm:text-sm bg-transparent"
          placeholder="팀 이름 또는 풋살장을 입력하세요"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {value && (
          <button
            className="size-4 rounded-full flex items-center justify-center bg-black/80 hover:bg-black transition-colors shrink-0"
            onClick={onClear}
            type="button"
            aria-label="검색어 지우기"
          >
            <X className="size-3 text-white/80" strokeWidth={2.5} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
