"use client";

import { X } from "lucide-react";
import Link from "next/link";

const AddMatchContent = ({ scheduleId }: { scheduleId: string }) => {
  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <h1 className="text-[1.625rem] font-bold">경기 추가</h1>
        <Link
          className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
          href={`/schedule/${scheduleId}`}
        >
          <X className="size-6" />
        </Link>
      </div>
      {/* <div className="space-y-6">
        <NewForm teams={data.data?.teams} userId={userId} />
      </div> */}
    </div>
  );
};

export default AddMatchContent;
