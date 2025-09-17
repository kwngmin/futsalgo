// @/app/(main-layout)/home/components/FilterBar.tsx
"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { MatchTypeOption } from "./FilterScheduleMatch";
import { DaysFilter } from "./FilterScheduleDays";
import { LocationFilter } from "./FilterLocation";
import { FilterOption } from "../model/types";
import { StartPeriodFilter } from "./FilterSchedulePeriod";

type ScheduleFilterType =
  | null
  | "matchType"
  | "days"
  | "location"
  | "startPeriod";

interface ScheduleFilterValues {
  matchType?: MatchTypeOption;
  days?: DaysFilter;
  location?: LocationFilter;
  time?: StartPeriodFilter;
}

const ScheduleFilterBar = ({
  filterOptions,
  openFilter,
  setOpenFilter,
  filterValues,
  setFilterValues,
}: {
  filterOptions: FilterOption[];
  openFilter: ScheduleFilterType;
  setOpenFilter: (filter: ScheduleFilterType) => void;
  filterValues: ScheduleFilterValues;
  setFilterValues: (values: ScheduleFilterValues) => void;
}) => {
  // 필터 버튼 컴포넌트
  const FilterButton = ({ option }: { option: FilterOption }) => (
    <button
      className={`sm:text-sm font-medium border bg-gray-100 hover:bg-white pr-2 lg:pr-1.5 flex items-center gap-1.5 justify-center rounded-full cursor-pointer active:scale-98 shrink-0 relative p-1 group ${
        option.icon ? "pl-1" : "pl-3.5 lg:pl-3"
      } ${
        openFilter === option.value
          ? "border-gray-600 font-semibold"
          : "border-gray-400/50 hover:border-gray-400"
      }`}
      aria-label={`${option.label} 필터`}
      onClick={() => {
        if (openFilter === option.value) {
          setOpenFilter(null);
        } else {
          setOpenFilter(option.value as ScheduleFilterType);
        }
      }}
    >
      {option.icon && (
        <div className="size-7 lg:size-6 rounded-full flex items-center justify-center bg-white group-hover:bg-gray-100">
          <option.icon
            className="size-4.5 lg:size-4"
            weight={openFilter === option.value ? "fill" : "regular"}
          />
        </div>
      )}
      <div className="flex items-center gap-1">
        {option.label}
        {openFilter === option.value ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </div>
    </button>
  );

  return (
    <div className="flex items-center gap-2 select-none relative">
      <div className="absolute right-0 top-0 w-8 h-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      <div className="grow overflow-hidden h-10 lg:h-9 flex items-start">
        <div
          className="w-full overflow-y-hidden overflow-x-scroll flex gap-1.5 pl-4 pr-8 scrollbar-hide"
          style={{
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE/Edge */,
            WebkitOverflowScrolling: "touch" /* iOS 부드러운 스크롤 */,
          }}
        >
          {filterOptions.map((option) =>
            filterValues[option.value as keyof typeof filterValues] ? (
              <div
                className="sm:text-sm font-semibold text-white bg-black/80 hover:bg-black pr-2.5 lg:pr-2 pl-4 flex items-center gap-1 justify-center rounded-full cursor-pointer active:scale-98 shrink-0"
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

export default ScheduleFilterBar;
