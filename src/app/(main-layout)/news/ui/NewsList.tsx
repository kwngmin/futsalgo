"use client";

import { TournamentNewsWithDetails } from "../actions/get-tournament-news";
import NewsCard from "./NewsCard";
import { SmileyXEyesIcon } from "@phosphor-icons/react";

interface NewsListProps {
  news: TournamentNewsWithDetails[];
  isLoading?: boolean;
}

/**
 * 대회 소식 목록 컴포넌트
 */
const NewsList = ({ news, isLoading }: NewsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="mx-4 h-48 bg-gray-200 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center">
        <SmileyXEyesIcon
          className="size-24 mx-auto text-gray-300 mb-3"
          weight="fill"
        />
        <h3 className="text-lg font-medium text-gray-900">소식이 없습니다</h3>
        <p className="text-gray-500 mb-6">
          새로운 소식이 등록되면 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div>
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
};

export default NewsList;

