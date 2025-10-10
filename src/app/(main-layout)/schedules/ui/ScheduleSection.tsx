// @/app/(main-layout)/home/components/ScheduleSection.tsx
"use client";

import { Separator } from "@/shared/components/ui/separator";
import ScheduleList from "./ScheduleList";
import { ScheduleWithDetails } from "@/app/(main-layout)/schedules/actions/get-schedules";
import { SmileyXEyesIcon } from "@phosphor-icons/react";

interface ScheduleSectionProps {
  todaysSchedules?: ScheduleWithDetails[];
  upcomingSchedules?: ScheduleWithDetails[];
  pastSchedules?: ScheduleWithDetails[];
  userId?: string;
  error?: Error | null;
  isFetching?: boolean;
}

interface SectionHeaderProps {
  dotColor: string;
  title: string;
  subtitle: string;
}

const ScheduleSection = ({
  todaysSchedules,
  upcomingSchedules,
  pastSchedules,
  userId,
  error,
  isFetching,
}: ScheduleSectionProps) => {
  // 섹션 헤더 컴포넌트
  const SectionHeader = ({ dotColor, title, subtitle }: SectionHeaderProps) => (
    <div className="flex items-center gap-2 mt-3 overflow-hidden px-5 h-8">
      <span className="text-sm sm:text-xs font-medium text-gray-700 shrink-0">
        {title}
      </span>
      <Separator orientation="vertical" className="!h-3" />
      <div className="flex items-center gap-1.5">
        <div className={`size-2.5 ${dotColor} rounded-full`} />
        <span
          className={`text-sm sm:text-xs font-medium ${
            subtitle === "전체공개" ? "text-green-700" : "text-muted-foreground"
          } shrink-0`}
        >
          {subtitle}
        </span>
      </div>
      <Separator className="min-w-20 grow data-[orientation=horizontal]:w-auto" />
    </div>
  );

  // 일정 리스트 렌더링
  const renderScheduleList = (schedules?: ScheduleWithDetails[]) => {
    return schedules?.map((schedule) => (
      <ScheduleList schedule={schedule} key={schedule.id} />
    ));
  };

  // 빈 상태 컴포넌트
  const EmptyState = () => (
    <div className="text-center py-12 flex flex-col items-center justify-center h-[65vh]">
      {/* <div className="w-16 h-16 mx-auto text-gray-300 mb-4" /> */}
      <SmileyXEyesIcon
        className="size-28 mx-auto text-gray-200 mb-4"
        weight="fill"
      />
      <h3 className="text-lg font-medium text-gray-900">경기가 없습니다</h3>
      <p className="text-gray-500 mb-6">
        경기를 추가하고 골과 어시스트를 기록하세요
      </p>
    </div>
  );

  // 에러 상태 컴포넌트
  const ErrorState = ({ message }: { message: string }) => (
    <div className="mx-4 bg-red-50 rounded-2xl px-4 h-14 flex justify-center items-center text-sm text-red-600">
      {message}
    </div>
  );

  return (
    <div className={userId ? "" : "mt-3"}>
      {/* 오늘 일정 */}
      {todaysSchedules && todaysSchedules.length > 0 && (
        <>
          <SectionHeader
            dotColor="bg-gray-400"
            title="오늘 일정"
            subtitle="비공개"
          />
          {renderScheduleList(todaysSchedules)}
        </>
      )}

      {/* 예정된 일정 */}
      {upcomingSchedules && upcomingSchedules.length > 0 && (
        <>
          <SectionHeader
            dotColor="bg-gray-400"
            title="예정된 일정"
            subtitle="비공개"
          />
          {renderScheduleList(upcomingSchedules)}
        </>
      )}

      {isFetching && (
        <div className="px-4">
          {Array.from({ length: 10 }).map((_, index) => {
            return (
              <div key={index} className="flex items-center gap-3 py-2">
                <div className="size-14 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                <div className="grow flex flex-col gap-2">
                  <div className="w-48 h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="w-32 h-5 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="size-10 flex items-center justify-center">
                  <div className="size-6 bg-gray-100 rounded-full animate-pulse" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 빈 상태 */}
      {!isFetching &&
        userId &&
        todaysSchedules?.length === 0 &&
        upcomingSchedules?.length === 0 &&
        pastSchedules?.length === 0 && <EmptyState />}

      {/* 지난 일정 */}
      {pastSchedules && pastSchedules.length > 0 && (
        <>
          {userId && (
            <SectionHeader
              dotColor="bg-emerald-500"
              title="지난 일정"
              subtitle="전체공개"
            />
          )}
          {renderScheduleList(pastSchedules)}
        </>
      )}

      {/* 에러 상태 */}
      {error && <ErrorState message={error.message} />}
    </div>
  );
};

export default ScheduleSection;
