// @/app/(main-layout)/home/components/FilterBar.tsx
"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import {
  CalendarDotsIcon,
  ClockIcon,
  FunnelIcon,
  MapPinAreaIcon,
} from "@phosphor-icons/react";
import { MatchTypeOption } from "./FilterMatchType";
import { DaysFilter } from "./FilterDays";
import { TimeFilter } from "./FilterTime.test";
import { LocationFilter } from "./FilterLocation";

interface FilterOption {
  icon?: React.ReactNode;
  label: string;
  value: string;
}

const FilterBar = ({
  openFilter,
  setOpenFilter,
  filterValues,
  setFilterValues,
}: {
  openFilter: null | "matchType" | "days" | "location" | "startPeriod";
  setOpenFilter: (
    filter: null | "matchType" | "days" | "location" | "startPeriod"
  ) => void;
  filterValues: {
    matchType?: MatchTypeOption;
    days?: DaysFilter;
    location?: LocationFilter;
    time?: TimeFilter;
  };
  setFilterValues: (values: {
    matchType?: MatchTypeOption;
    days?: DaysFilter;
    location?: LocationFilter;
    time?: TimeFilter;
  }) => void;
}) => {
  // 필터 옵션 설정
  const filterOptions: FilterOption[] = [
    {
      icon: (
        <FunnelIcon
          className="size-4 text-gray-700"
          // weight="fill"
        />
      ),
      label: "분류",
      value: "matchType",
    },
    {
      icon: (
        <MapPinAreaIcon
          className="size-4 text-gray-700"
          // weight="fill"
        />
      ),
      label: "지역",
      value: "location",
    },
    {
      icon: (
        <CalendarDotsIcon
          className="size-4 text-gray-700" //
          // weight="fill"
        />
      ),
      label: "요일",
      value: "days",
    },
    {
      icon: (
        <ClockIcon
          className="size-4 text-gray-700"
          // weight="fill"
        />
      ),
      label: "시간대",
      value: "startPeriod",
    },
  ];

  // 필터 버튼 컴포넌트
  const FilterButton = ({ option }: { option: FilterOption }) => (
    <button
      className={`sm:text-sm font-medium border hover:bg-gray-200/80 active:bg-gray-200 bg-gray-50 pr-2 sm:pr-1.5 h-9 sm:h-8 flex items-center gap-1 justify-center rounded-full cursor-pointer active:scale-95 shrink-0 ${
        option.icon ? "pl-3 sm:pl-2.5 " : "pl-3.5 sm:pl-3"
      } ${
        openFilter === option.value
          ? "border-gray-500 font-semibold"
          : "border-gray-300"
      }`}
      aria-label={`${option.label} 필터`}
      onClick={() => {
        if (openFilter === option.value) {
          setOpenFilter(null);
        } else {
          setOpenFilter(
            option.value as "matchType" | "days" | "location" | "startPeriod"
          );
        }
      }}
    >
      {option.icon}
      {option.label}
      {openFilter === option.value ? (
        <ChevronUp className="size-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="size-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="flex items-center gap-2 select-none relative">
      <div className="absolute right-0 top-0 w-8 h-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      <div className="grow overflow-hidden h-9 sm:h-8 flex items-start">
        <div className="w-full overflow-y-hidden overflow-x-scroll flex gap-1.5 pl-4 pr-8">
          {filterOptions.map((option) =>
            filterValues[option.value as keyof typeof filterValues] ? (
              <div
                className="sm:text-sm font-semibold text-white bg-black/80 hover:bg-black pr-2 sm:pr-1.5 pl-3.5 sm:pl-3 h-9 sm:h-8 flex items-center gap-1 justify-center rounded-full cursor-pointer active:scale-95 shrink-0"
                key={option.value}
                onClick={() => {
                  setFilterValues({
                    ...filterValues,
                    [option.value as keyof typeof filterValues]: undefined,
                  });
                }}
              >
                {`${
                  filterValues[option.value as keyof typeof filterValues]?.label
                }`}
                <X className="size-4" />
              </div>
            ) : (
              <FilterButton key={option.value} option={option} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
