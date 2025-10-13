// components/PrivacySelector.tsx
"use client";

import { useState, useTransition } from "react";
import {
  fetchPrivacyContent,
  type PrivacyItem,
} from "../model/actions/fetch-privacy";
import MarkdownView from "@/shared/components/MarkdownViewer";
import { ChevronDown, X } from "lucide-react";
import Link from "next/link";

type PrivacySelectorProps = {
  initialList: PrivacyItem[];
  initialContent: string;
};

const PrivacySelector = ({
  initialList,
  initialContent,
}: PrivacySelectorProps) => {
  const [selectedFileName, setSelectedFileName] = useState(
    initialList[0].fileName
  );
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  console.log(content, "content");
  const handleSelectChange = (fileName: string) => {
    setSelectedFileName(fileName);

    // useTransition을 사용하여 UI 블로킹 없이 콘텐츠 로드
    startTransition(async () => {
      try {
        const newContent = await fetchPrivacyContent(fileName);
        setContent(newContent);
      } catch (error) {
        console.error("Failed to load privacy content:", error);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 px-4 relative">
      <div className="sm:hidden flex items-center justify-end h-16 shrink-0 absolute -top-8 right-4">
        <Link
          href="/more"
          className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
        >
          <X className="size-6" />
        </Link>
      </div>
      <div
        className={
          isPending ? "opacity-50 transition-opacity" : "transition-opacity"
        }
      >
        <MarkdownView content={content} />
      </div>
      <div className="relative mt-12">
        <select
          value={selectedFileName}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="appearance-none h-12 sm:h-11 border border-gray-300 px-4 cursor-pointer w-full rounded-sm focus:border focus:outline-0 focus:border-gray-400 focus:ring-4 focus:ring-gray-200"
          disabled={isPending}
        >
          {initialList.map((item) => (
            <option key={item.id} value={item.fileName}>
              {item.date}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown
            className="size-5 opacity-70 stroke-muted-foreground"
            strokeWidth={2.5}
          />
        </div>
        {isPending && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacySelector;
