// @/app/(main-layout)/home/components/FilterBar.tsx
"use client";

import { ChevronDown } from "lucide-react";
import {
  CalendarDotsIcon,
  MapPinAreaIcon,
  SunHorizonIcon,
} from "@phosphor-icons/react";

interface FilterOption {
  icon?: React.ReactNode;
  label: string;
  value: string;
}

const FilterBar = () => {
  // 필터 옵션 설정
  const filterOptions: FilterOption[] = [
    { label: "경기 분류", value: "match-type" },
    {
      icon: <MapPinAreaIcon className="size-5 text-gray-700" weight="fill" />,
      label: "지역",
      value: "location",
    },
    {
      icon: <CalendarDotsIcon className="size-5 text-gray-700" weight="fill" />,
      label: "요일",
      value: "weekday",
    },
    {
      icon: <SunHorizonIcon className="size-5 text-gray-700" weight="fill" />,
      label: "시간",
      value: "time",
    },
  ];

  // 필터 버튼 컴포넌트
  const FilterButton = ({ option }: { option: FilterOption }) => (
    <button
      className="sm:text-sm font-medium border border-gray-300 bg-gray-50 hover:bg-gray-200/80 active:bg-gray-200 pl-3 sm:pl-2.5 pr-2 sm:pr-1.5 h-9 sm:h-8 flex items-center gap-1 justify-center rounded-full cursor-pointer active:scale-95 shrink-0"
      aria-label={`${option.label} 필터`}
    >
      {option.icon}
      {option.label}
      <ChevronDown className="size-4 text-muted-foreground" />
    </button>
  );

  return (
    <div className="flex items-center gap-2 select-none relative">
      <div className="absolute right-0 top-0 w-8 h-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      <div className="grow overflow-hidden h-9 sm:h-8 flex items-start">
        <div className="w-full overflow-y-hidden overflow-x-scroll flex gap-1.5 pl-4 pr-8">
          {filterOptions.map((option) => (
            <FilterButton key={option.value} option={option} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
