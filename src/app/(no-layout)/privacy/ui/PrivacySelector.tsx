// components/PrivacySelector.tsx
"use client";

import { useState, useTransition } from "react";
import {
  fetchPrivacyContent,
  type PrivacyItem,
} from "../model/actions/fetch-privacy";
import MarkdownView from "@/shared/components/MarkdownViewer";

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
    <div className="max-w-2xl mx-auto pb-16 space-y-6 px-4">
      <div className="flex items-center justify-between h-16 shrink-0">
        <h1 className="text-[1.625rem] font-bold cursor-pointer transition-opacity">
          개인정보 처리방침
        </h1>

        <div className="relative">
          <select
            value={selectedFileName}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPending}
          >
            {initialList.map((item) => (
              <option key={item.id} value={item.fileName}>
                {item.date}
              </option>
            ))}
          </select>
          {isPending && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
      <div
        className={
          isPending ? "opacity-50 transition-opacity" : "transition-opacity"
        }
      >
        <MarkdownView content={content} />
      </div>
    </div>
  );
};

export default PrivacySelector;
