"use client";

import { TournamentNewsWithDetails } from "../actions/get-tournament-news";
import { Card } from "@/shared/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface NewsCardProps {
  news: TournamentNewsWithDetails;
}

/**
 * 대회 소식 카드 컴포넌트
 * 포스터 중심 레이아웃: 제목, 날짜, 포스터만 표시
 */
const NewsCard = ({ news }: NewsCardProps) => {
  /**
   * 날짜 포맷팅
   * startDate와 endDate가 같으면 일자만 표시, 다르면 기간으로 표시
   */
  const formatDateRange = () => {
    if (!news.startDate) return null;

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const start = new Date(news.startDate);
    const end = news.endDate ? new Date(news.endDate) : null;

    // 종료일이 없으면 시작일만 표시
    if (!end) {
      return formatDate(start);
    }

    // 시작일과 종료일이 같으면 일자만 표시
    if (
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate()
    ) {
      return formatDate(start);
    }

    // 다르면 기간으로 표시
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  };

  const dateRange = formatDateRange();

  return (
    <Link href={`/news/${news.id}`} className="block">
      <Card className="mx-4 mb-4 cursor-pointer hover:shadow-md transition-shadow overflow-hidden py-0 gap-0">
        {/* 제목과 날짜 */}
        <div className="pb-3 space-y-1">
          <h3 className="text-lg sm:text-xl font-bold line-clamp-2">
            {news.title}
          </h3>
          {dateRange && (
            <p className="text-sm text-muted-foreground">
              <span className="font-bold">일정:</span> {dateRange}
            </p>
          )}
        </div>

        {/* 포스터 이미지 - 메인 */}
        <div className="relative w-full">
          {news.posterUrl ? (
            <>
              <div className="relative w-full">
                <Image
                  src={news.posterUrl}
                  alt={news.title}
                  width={1080}
                  height={1440}
                  className="w-full h-auto"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px"
                  quality={100}
                  priority={news.isPinned}
                />
              </div>
              {/* 고정 배지 */}
              {news.isPinned && (
                <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded z-10">
                  고정
                </span>
              )}
            </>
          ) : (
            <div className="w-full aspect-[4/3] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">포스터 이미지 없음</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default NewsCard;
