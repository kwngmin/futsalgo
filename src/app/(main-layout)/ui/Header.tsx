// @/app/(main-layout)/home/components/Header.tsx
"use client";

import { Search } from "lucide-react";
import { memo } from "react";
import SearchInput from "../../../features/filter-list/ui/SearchInput";

type TabType = "schedules" | "my-schedules";

interface HeaderProps {
  currentTab: TabType;
  searchFocused: boolean;
  searchValue: string;
  onTabChange: (tab: TabType) => void;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onSearchFocus: () => void;
  onSearchClose: () => void;
}

const Header = memo(
  ({
    currentTab,
    searchFocused,
    searchValue,
    onTabChange,
    onSearchChange,
    onSearchClear,
    onSearchFocus,
    onSearchClose,
  }: HeaderProps) => {
    // 탭 컴포넌트
    const TabButton = ({ tab, label }: { tab: TabType; label: string }) => (
      <h1
        className={`text-2xl font-bold cursor-pointer transition-opacity ${
          currentTab === tab ? "" : "opacity-30 hover:opacity-50"
        }`}
        onClick={() => onTabChange(tab)}
      >
        {label}
      </h1>
    );

    // 검색 버튼 컴포넌트
    const SearchButton = () => (
      <button
        className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        onClick={onSearchFocus}
      >
        <Search className="size-5" />
      </button>
    );

    // 닫기 버튼 컴포넌트
    const CloseButton = () => (
      <button
        className="shrink-0 px-3 h-10 sm:h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer text-sm font-semibold active:bg-gray-200"
        onClick={onSearchClose}
      >
        닫기
      </button>
    );

    return (
      <>
        {/* 데스크톱 헤더 */}
        <div className="hidden sm:flex items-center justify-between px-4 h-16 shrink-0">
          <div className="flex gap-3">
            <TabButton tab="schedules" label="경기일정" />
            <TabButton tab="my-schedules" label="내 일정" />
          </div>
          <div className="flex items-center gap-2">
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              onClear={onSearchClear}
            />
          </div>
        </div>

        {/* 모바일 헤더 */}
        {!searchFocused ? (
          <div className="flex sm:hidden items-center justify-between px-4 h-16 shrink-0">
            <div className="flex gap-3">
              <TabButton tab="schedules" label="경기일정" />
              <TabButton tab="my-schedules" label="내 일정" />
            </div>
            <div className="flex items-center gap-2">
              <SearchButton />
            </div>
          </div>
        ) : (
          <div className="flex sm:hidden items-center justify-between px-4 h-16 shrink-0 gap-2">
            <SearchInput
              // placeholderText="팀 이름 또는 풋살장 검색"
              value={searchValue}
              onChange={onSearchChange}
              onClear={onSearchClear}
              isMobile
            />
            <CloseButton />
          </div>
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    // 검색 관련 props와 현재 탭만 비교하여 리렌더링 최적화
    // data 변경은 이 컴포넌트 리렌더링을 트리거하지 않음
    return (
      prevProps.currentTab === nextProps.currentTab &&
      prevProps.searchFocused === nextProps.searchFocused &&
      prevProps.searchValue === nextProps.searchValue
    );
  }
);

Header.displayName = "Header";

export default Header;
