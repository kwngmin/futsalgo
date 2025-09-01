"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  getTeams,
  GetTeamsReturn,
} from "@/features/add-schedule/model/actions/get-my-teams";
import { getScheduleById } from "@/features/edit-schedule/model/actions/get-schedule-by-id.test";
import { updateSchedule } from "@/features/edit-schedule/model/actions/update-schedule.test";
import { deleteSchedule } from "@/features/edit-schedule/model/actions/delete-schedule";
import EditScheduleForm, { type EditFormData } from "./EditScheduleForm";

// 공통 헤더 컴포넌트 추출
const ScheduleHeader = ({ onGoBack }: { onGoBack: () => void }) => (
  <div className="flex items-center justify-between px-4 h-16 shrink-0">
    <h1 className="text-2xl font-bold">일정 수정</h1>
    <button
      className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
      onClick={onGoBack}
      aria-label="닫기"
    >
      <X className="size-5" />
    </button>
  </div>
);

// 에러 상태 컴포넌트
const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-red-500">오류: {message}</div>
  </div>
);

// 로딩 상태 컴포넌트
const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-gray-500">로딩 중...</div>
  </div>
);

// 레이아웃 래퍼 컴포넌트
const ScheduleLayout = ({
  children,
  onGoBack,
}: {
  children: React.ReactNode;
  onGoBack: () => void;
}) => (
  <div className="max-w-2xl mx-auto pb-16 flex flex-col">
    <ScheduleHeader onGoBack={onGoBack} />
    {children}
  </div>
);

const EditScheduleContent = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;

  // 팀 목록 조회
  const {
    data: teamsData,
    isLoading: isTeamsLoading,
    error: teamsError,
  } = useQuery({
    queryKey: ["myTeams", userId],
    queryFn: () => getTeams(userId) as Promise<GetTeamsReturn>,
    placeholderData: keepPreviousData,
    enabled: !!userId,
  });

  // 일정 조회
  const {
    data: scheduleData,
    isLoading: isScheduleLoading,
    error: scheduleError,
  } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => getScheduleById(scheduleId),
    enabled: !!scheduleId,
  });

  console.log(scheduleData, "scheduleData");

  const handleGoBack = () => {
    router.back();
  };

  const handleUpdate = async (formData: EditFormData) => {
    await updateSchedule(scheduleId, formData);
  };

  const handleDelete = async () => {
    await deleteSchedule(scheduleId);
  };

  // 로딩 상태 처리
  if (isTeamsLoading || isScheduleLoading) {
    return (
      <ScheduleLayout onGoBack={handleGoBack}>
        <LoadingState />
      </ScheduleLayout>
    );
  }

  // 에러 상태 처리
  if (teamsError || scheduleError) {
    const errorMessage = teamsError
      ? "팀 정보를 불러올 수 없습니다"
      : "일정 정보를 불러올 수 없습니다";

    return (
      <ScheduleLayout onGoBack={handleGoBack}>
        <ErrorState message={errorMessage} />
      </ScheduleLayout>
    );
  }

  // 데이터 없음 처리
  if (!teamsData || !scheduleData) {
    return (
      <ScheduleLayout onGoBack={handleGoBack}>
        <ErrorState message="데이터를 찾을 수 없습니다" />
      </ScheduleLayout>
    );
  }

  // API 응답 에러 처리
  if (teamsData.success === false) {
    return (
      <ScheduleLayout onGoBack={handleGoBack}>
        <ErrorState message={teamsData.error} />
      </ScheduleLayout>
    );
  }

  if (scheduleData.success === false) {
    return (
      <ScheduleLayout onGoBack={handleGoBack}>
        <ErrorState message={scheduleData.error} />
      </ScheduleLayout>
    );
  }

  // 정상 렌더링
  return (
    <ScheduleLayout onGoBack={handleGoBack}>
      <div className="space-y-6">
        <EditScheduleForm
          teams={teamsData.data.teams}
          userId={userId}
          existingSchedule={scheduleData.data}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </ScheduleLayout>
  );
};

export default EditScheduleContent;
