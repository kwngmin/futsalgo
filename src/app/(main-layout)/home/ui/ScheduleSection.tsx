// @/app/(main-layout)/home/components/ScheduleSection.tsx
"use client";

import { Separator } from "@/shared/components/ui/separator";
import ScheduleList from "../ui/ScheduleList";
import { ScheduleWithDetails } from "@/app/(main-layout)/home/actions/get-schedules";

interface ScheduleSectionProps {
  todaysSchedules?: ScheduleWithDetails[];
  upcomingSchedules?: ScheduleWithDetails[];
  pastSchedules?: ScheduleWithDetails[];
  userId?: string;
  error?: Error | null;
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
    <div className="mx-4 bg-neutral-50 rounded-2xl px-4 h-24 flex justify-center items-center text-sm text-muted-foreground mt-3">
      경기가 없습니다.
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

      {/* 빈 상태 */}
      {userId &&
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
