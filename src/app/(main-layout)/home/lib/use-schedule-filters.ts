import { useState, useCallback, useMemo } from "react";
import { DayOfWeek, Period } from "@prisma/client";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { ScheduleFilters } from "@/features/filter-list/model/types";
import { TabType } from "@/features/tab-and-search/ui/ListHeader";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { DaysFilter } from "@/features/filter-list/ui/FilterScheduleDays";
import { StartPeriodFilter } from "@/features/filter-list/ui/FilterSchedulePeriod";

type FilterType = "matchType" | "days" | "location" | "startPeriod";

interface FilterValues {
  matchType?: { value: "TEAM" | "SQUAD"; label: string };
  days?: DaysFilter;
  location?: { city: string; district?: string; label: string };
  startPeriod?: StartPeriodFilter;
}

/**
 * 일정 필터 관리 커스텀 훅
 */
export const useScheduleFilters = (
  initialSearch: string,
  router: AppRouterInstance
) => {
  const [currentTab, setCurrentTab] = useState<TabType>("schedules");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [openFilter, setOpenFilter] = useState<FilterType | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const convertDaysFilterToArray = useCallback(
    (daysFilter: DaysFilter): DayOfWeek[] => {
      return Object.entries(daysFilter)
        .filter(([key, value]) => key !== "label" && value === true)
        .map(([key]) => key as DayOfWeek);
    },
    []
  );

  const convertStartPeriodFilterToArray = useCallback(
    (startPeriodFilter: StartPeriodFilter): Period[] => {
      return Object.entries(startPeriodFilter)
        .filter(([key, value]) => key !== "label" && value === true)
        .map(([key]) => key as Period);
    },
    []
  );

  const filters = useMemo<ScheduleFilters>(() => {
    const filterObj: ScheduleFilters = {
      searchQuery: debouncedSearchValue,
    };

    if (filterValues.matchType) {
      filterObj.matchType = filterValues.matchType.value;
    }

    if (filterValues.days) {
      const selectedDays = convertDaysFilterToArray(filterValues.days);
      if (selectedDays.length > 0 && selectedDays.length < 7) {
        filterObj.days = selectedDays;
      }
    }

    if (filterValues.startPeriod) {
      const selectedPeriods = convertStartPeriodFilterToArray(
        filterValues.startPeriod
      );
      if (selectedPeriods.length > 0 && selectedPeriods.length < 5) {
        filterObj.startPeriod = selectedPeriods;
      }
    }

    if (filterValues.location) {
      filterObj.city = filterValues.location.city;
      filterObj.district = filterValues.location.district;
    }

    return filterObj;
  }, [
    debouncedSearchValue,
    filterValues,
    convertDaysFilterToArray,
    convertStartPeriodFilterToArray,
  ]);

  const handleTabChange = useCallback(
    (tab: TabType) => {
      setCurrentTab(tab);
      if (tab === "my-schedules") {
        router.push("/my-schedules");
      }
    },
    [router]
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

  const handleFilterClose = useCallback(() => {
    setOpenFilter(null);
  }, []);

  const handleFilterChange = useCallback((values: Partial<FilterValues>) => {
    setFilterValues((prev) => ({ ...prev, ...values }));
  }, []);

  return {
    currentTab,
    searchFocused,
    searchValue,
    openFilter,
    filterValues,
    filters,
    handleTabChange,
    handleSearchChange,
    handleSearchClear,
    handleSearchFocus,
    handleSearchClose,
    handleFilterClose,
    handleFilterChange,
    setOpenFilter,
    setFilterValues,
  };
};
