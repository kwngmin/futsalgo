import { useState, useCallback, useMemo } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type NewsTabType = "all" | "saved";

interface NewsFilters {
  searchQuery?: string;
  tab?: NewsTabType;
}

/**
 * 뉴스 필터 관리 커스텀 훅
 */
export const useNewsFilters = ({
  initialSearch,
  router,
  defaultTab = "all",
}: {
  initialSearch: string;
  router: AppRouterInstance;
  defaultTab?: NewsTabType;
}) => {
  const [currentTab, setCurrentTab] = useState<NewsTabType>(defaultTab);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState(initialSearch);

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const filters = useMemo<NewsFilters>(() => {
    return {
      searchQuery: debouncedSearchValue,
      tab: currentTab,
    };
  }, [debouncedSearchValue, currentTab]);

  const handleTabChange = useCallback(
    (tab: NewsTabType) => {
      setCurrentTab(tab);
      // 찜한 소식 탭으로 이동 시 로그인 체크 (향후 구현)
      // if (tab === "saved") {
      //   // 로그인 확인 로직
      // }
    },
    []
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchValue("");
  }, []);

  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchFocused(false);
    setSearchValue("");
  }, []);

  return {
    currentTab,
    searchFocused,
    searchValue,
    filters,
    handleTabChange,
    handleSearchChange,
    handleSearchClear,
    handleSearchFocus,
    handleSearchClose,
  };
};

