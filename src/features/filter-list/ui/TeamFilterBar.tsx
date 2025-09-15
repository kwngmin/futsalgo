// @/app/(main-layout)/home/components/FilterBar.tsx
"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { LocationFilter } from "./FilterLocation";
import { FilterOption } from "../model/types";
import { TeamGenderFilter } from "./FilterTeamGender";
import { TeamRecruitmentFilter } from "./FilterTeamRecruitment";
import { TeamLevelFilter } from "./FilterTeamLevel";
import { TeamMatchAvailableFilter } from "./FilterTeamMatchAvailable";

export type TeamFilterType =
  | null
  | "gender"
  | "location"
  | "recruitment"
  | "teamMatchAvailable"
  | "teamLevel";

export interface TeamFilterValues {
  gender?: TeamGenderFilter;
  location?: LocationFilter;
  recruitment?: TeamRecruitmentFilter;
  teamMatchAvailable?: TeamMatchAvailableFilter;
  teamLevel?: TeamLevelFilter;
}

const TeamFilterBar = ({
  filterOptions,
  openFilter,
  setOpenFilter,
  filterValues,
  setFilterValues,
}: {
  filterOptions: FilterOption[];
  openFilter: TeamFilterType;
  setOpenFilter: (filter: TeamFilterType) => void;
  filterValues: TeamFilterValues;
  setFilterValues: (values: TeamFilterValues) => void;
}) => {
  // 필터 버튼 컴포넌트
  const FilterButton = ({ option }: { option: FilterOption }) => (
    <button
      className={`sm:text-sm font-medium bg-gray-50 hover:bg-gray-100 border active:bg-gray-200 pr-2 lg:pr-1.5 h-10 lg:h-9 flex items-center gap-2 justify-center rounded-full cursor-pointer active:scale-98 shrink-0 relative p-1 ${
        option.icon ? "pl-1" : "pl-3.5 lg:pl-3"
      } ${
        openFilter === option.value
          ? "border-gray-600 font-semibold"
          : "border-gray-200 hover:border-gray-400"
      }`}
      aria-label={`${option.label} 필터`}
      onClick={() => {
        if (openFilter === option.value) {
          setOpenFilter(null);
        } else {
          setOpenFilter(option.value as TeamFilterType);
        }
      }}
    >
      {option.icon && (
        <div className="size-8 lg:size-7 rounded-full flex items-center justify-center bg-white inset-shadow-sm inset-shadow-gray-300 shadow-sm shadow-gray-400">
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
                className="sm:text-sm font-semibold text-white bg-black/80 hover:bg-black pr-2.5 lg:pr-2 pl-4.5 lg:pl-4 h-10 lg:h-9 flex items-center gap-1 justify-center rounded-full cursor-pointer active:scale-98 shrink-0"
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

export default TeamFilterBar;
