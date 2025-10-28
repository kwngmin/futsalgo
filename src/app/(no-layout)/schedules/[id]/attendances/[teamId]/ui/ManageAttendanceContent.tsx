"use client";

import { AttendanceStatus, Prisma } from "@prisma/client";
import { Minus, Plus, RefreshCcw, SquareCheckBig, X } from "lucide-react";
import { addAttendances } from "../actions/add-attendances";
import { updateAttendance } from "../actions/update-attendance";
import { updateMercenaryCount } from "../actions/update-mercenary-count";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { updateAllAttendanceStatus } from "../actions/update-all-attendace-status";
import { removeAttendance } from "../actions/remove-attendance";
import { Separator } from "@/shared/components/ui/separator";
import Link from "next/link";

type AttendanceWithUser = Prisma.ScheduleAttendanceGetPayload<{
  select: {
    id: true;
    attendanceStatus: true;
    user: {
      select: {
        nickname: true;
        name: true;
      };
    };
  };
}>;

interface ManageAttendanceContentProps {
  scheduleId: string;
  data: AttendanceWithUser[];
  teamId: string;
  teamType: "HOST" | "INVITED";
  initialMercenaryCount: number;
}

const ATTENDANCE_STATUS_CONFIG = {
  ATTENDING: { label: "참석", color: "text-emerald-600" },
  NOT_ATTENDING: { label: "불참", color: "text-destructive" },
  UNDECIDED: { label: "미정", color: "text-gray-600" },
} as const;

const ManageAttendanceContent = ({
  scheduleId,
  data,
  teamId,
  teamType,
  initialMercenaryCount,
}: ManageAttendanceContentProps) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showAllAttendanceMenu, setShowAllAttendanceMenu] = useState(false);
  const [mercenaryCount, setMercenaryCount] = useState(initialMercenaryCount);
  const [isMercenaryUpdating, setIsMercenaryUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.id.localeCompare(b.id));
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowAllAttendanceMenu(false);
      }
    };

    if (showAllAttendanceMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAllAttendanceMenu]);

  // 쿼리 무효화를 위한 공통 함수
  const invalidateScheduleQueries = useCallback(() => {
    // 다른 페이지의 쿼리도 무효화하기 위해 refetchType: "all" 사용
    queryClient.invalidateQueries({
      queryKey: ["scheduleAttendance", scheduleId],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["schedule", scheduleId],
      refetchType: "all",
    });
  }, [queryClient, scheduleId]);

  const handleUpdate = async ({
    attendanceId,
    attendanceStatus,
  }: {
    attendanceId: string;
    attendanceStatus: AttendanceStatus;
  }) => {
    try {
      setIsLoading(true);
      const result = await updateAttendance({
        scheduleId,
        teamId,
        teamType,
        attendanceId,
        attendanceStatus,
      });

      if (result.success) {
        invalidateScheduleQueries();
      } else {
        alert(result.error || "참석 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAll = async (attendanceStatus: AttendanceStatus) => {
    const statusText = ATTENDANCE_STATUS_CONFIG[attendanceStatus].label;

    if (!confirm(`모든 팀원을 "${statusText}"으로 일괄 변경하시겠습니까?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await updateAllAttendanceStatus({
        scheduleId,
        teamId,
        teamType,
        attendanceStatus,
      });

      if (result.success) {
        invalidateScheduleQueries();
        alert(result.message);
        setShowAllAttendanceMenu(false);
      } else {
        alert(result.error || "전체 참석처리에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAttendances = async () => {
    try {
      setIsLoading(true);

      const result = await addAttendances({ scheduleId, teamId, teamType });

      if (result.success) {
        invalidateScheduleQueries();
        alert("팀원 업데이트가 완료되었습니다.");
      } else {
        alert(result.error || "팀원 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("팀원 업데이트에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAttendance = async (
    attendanceId: string,
    userNickname: string
  ) => {
    if (!confirm(`${userNickname}님을 참석자 명단에서 제거하시겠습니까?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await removeAttendance({
        scheduleId,
        teamId,
        teamType,
        attendanceId,
      });

      if (result.success) {
        alert(result.message);
        invalidateScheduleQueries();
      } else {
        alert(result.error || "참석자 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMercenaryCountChange = async (newCount: number) => {
    if (newCount < 0) return;

    try {
      setIsMercenaryUpdating(true);
      const result = await updateMercenaryCount({
        scheduleId,
        teamId,
        teamType,
        mercenaryCount: newCount,
      });

      if (result.success) {
        setMercenaryCount(newCount);
        invalidateScheduleQueries();
      } else {
        alert(result.error || "용병 수 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsMercenaryUpdating(false);
    }
  };

  const renderAttendanceButton = (
    currentStatus: AttendanceStatus,
    targetStatus: AttendanceStatus,
    label: string,
    attendanceId: string
  ) => {
    const isActive = currentStatus === targetStatus;
    const config = ATTENDANCE_STATUS_CONFIG[targetStatus];

    return (
      <button
        type="button"
        disabled={isLoading}
        className={`text-sm rounded-sm flex items-center justify-center h-9 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive
            ? `bg-white border border-gray-300 shadow-xs font-semibold ${config.color}`
            : "text-muted-foreground font-medium hover:bg-gray-50"
        }`}
        onClick={() =>
          !isLoading &&
          handleUpdate({
            attendanceId,
            attendanceStatus: targetStatus,
          })
        }
      >
        {label}
      </button>
    );
  };

  const renderMercenaryButton = (count: number) => (
    <button
      key={count}
      type="button"
      disabled={isMercenaryUpdating || mercenaryCount === count}
      className={`w-full h-9 sm:w-9 rounded-sm border flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:cursor-default transition-colors cursor-pointer ${
        mercenaryCount === count
          ? "bg-white border-gray-300"
          : "border-transparent"
      }`}
      onClick={() => handleMercenaryCountChange(count)}
    >
      {count}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <header className="flex items-center justify-between px-4 h-16 shrink-0">
        <h1 className="text-[1.625rem] font-bold">팀원 명단</h1>
        <Link
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          href={`/schedules/${scheduleId}?tab=attendance`}
          aria-label="닫기"
        >
          <X className="size-6" />
        </Link>
      </header>

      <div className="px-4">
        <div className="grid grid-cols-2 gap-2 sm:max-w-2/3">
          <button
            type="button"
            disabled={isLoading}
            className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={() => handleUpdateAll("ATTENDING")}
          >
            <div className="flex items-center gap-2">
              <SquareCheckBig className="size-5 text-gray-400" />
              <span className="text-base font-medium">전체 참석처리</span>
            </div>
          </button>
          <button
            type="button"
            disabled={isLoading}
            className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleUpdateAttendances}
          >
            <div className="flex items-center gap-2">
              <RefreshCcw className="size-5 text-gray-400" />
              <span className="text-base font-medium">팀원 업데이트</span>
            </div>
          </button>
        </div>

        <div className="mt-4">
          {sortedData.map((attendance, index) => (
            <article
              key={attendance.id}
              className="flex items-center gap-4 py-3 border-t border-gray-100"
            >
              <div className="flex items-center justify-center size-6 text-sm font-medium text-muted-foreground">
                {index + 1}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 grow">
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">
                    {attendance.user.nickname}
                  </span>
                  <span className="font-medium text-muted-foreground">
                    {attendance.user.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:min-w-72">
                  <div className="grow grid grid-cols-3 p-0.5 rounded-md bg-gray-100">
                    {renderAttendanceButton(
                      attendance.attendanceStatus,
                      "ATTENDING",
                      "참석",
                      attendance.id
                    )}
                    {renderAttendanceButton(
                      attendance.attendanceStatus,
                      "NOT_ATTENDING",
                      "불참",
                      attendance.id
                    )}
                    {renderAttendanceButton(
                      attendance.attendanceStatus,
                      "UNDECIDED",
                      "미정",
                      attendance.id
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="flex items-center justify-center size-10 bg-destructive/5 rounded-md sm:hover:bg-destructive/10 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    onClick={() =>
                      !isLoading &&
                      handleRemoveAttendance(
                        attendance.id,
                        attendance.user.nickname!
                      )
                    }
                    aria-label={`${attendance.user.nickname} 삭제`}
                  >
                    <Minus className="size-4.5 sm:size-4 text-destructive" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <article className="flex items-center gap-4 py-3 border-t border-gray-100 min-h-16">
          <div className="flex items-center justify-center size-6 text-sm font-medium text-muted-foreground">
            -
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 grow">
            <div className="flex gap-2 items-center">
              <span className="font-semibold">용병</span>
              <span className="font-medium text-muted-foreground">
                경기에 참여 할 용병의 수
              </span>
            </div>
            <div className="flex items-center gap-2 sm:min-w-72 h-10 rounded-md bg-gray-100 p-0.5">
              <div className="grow grid grid-cols-4 sm:flex items-center gap-1">
                {[0, 1, 2, 3].map((count) => renderMercenaryButton(count))}
              </div>
              <Separator orientation="vertical" className="!h-7 w-px" />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isMercenaryUpdating || mercenaryCount <= 0}
                  className="w-10 sm:w-9 h-9 rounded-sm bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  onClick={() => handleMercenaryCountChange(mercenaryCount - 1)}
                >
                  <Minus className="size-4.5 sm:size-4" />
                </button>
                <span className="min-w-[3rem] sm:min-w-[2rem] text-center font-semibold text-lg">
                  {mercenaryCount}
                </span>
                <button
                  type="button"
                  disabled={isMercenaryUpdating}
                  className="w-10 sm:w-9 h-9 rounded-sm bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  onClick={() => handleMercenaryCountChange(mercenaryCount + 1)}
                >
                  <Plus className="size-4.5 sm:size-4" />
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ManageAttendanceContent;
