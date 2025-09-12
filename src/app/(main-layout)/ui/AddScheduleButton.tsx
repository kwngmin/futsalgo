// @/app/(main-layout)/home/components/AddScheduleButton.tsx
"use client";

import { ChevronRight, Plus } from "lucide-react";

interface AddScheduleButtonProps {
  onClick: () => void;
}

const AddScheduleButton = ({ onClick }: AddScheduleButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-20 md:left-20 lg:left-72 md:bottom-0 left-0 right-0 sm:max-w-2xs md:max-w-2xl mx-4 sm:mx-auto shrink-0 h-12 sm:h-10 md:h-11 flex items-center justify-between bg-indigo-600 text-white hover:bg-indigo-800 rounded-full md:rounded-b-none md:rounded-t-2xl transition-colors cursor-pointer font-semibold z-20 px-3 sm:px-2.5 md:px-3 active:bg-black"
      aria-label="새로운 일정 추가"
    >
      <div className="flex items-center justify-center gap-3 sm:gap-2">
        <div className="shrink-0 size-7 sm:size-6 flex items-center justify-center bg-white text-indigo-700 rounded-full">
          <Plus className="size-5" strokeWidth={2.5} />
        </div>
        <span className="sm:text-sm font-semibold">새로운 일정 추가</span>
      </div>
      <ChevronRight className="size-6 opacity-80" strokeWidth={1.5} />
    </button>
  );
};

export default AddScheduleButton;
