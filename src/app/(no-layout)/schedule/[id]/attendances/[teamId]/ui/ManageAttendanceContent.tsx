"use client";

import { AttendanceStatus, Prisma } from "@prisma/client";
import { Minus, Plus, RefreshCcw, SquareCheckBig, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { addAttendances } from "../actions/add-attendances";
import { updateAttendance } from "../actions/update-attendance";
import { updateMercenaryCount } from "../actions/update-mercenary-count";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef, useMemo } from "react";
import { updateAllAttendanceStatus } from "../actions/update-all-attendace-status";
import { removeAttendance } from "../actions/remove-attendance";
import { Separator } from "@/shared/components/ui/separator";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showAllAttendanceMenu, setShowAllAttendanceMenu] = useState(false);
  const [mercenaryCount, setMercenaryCount] = useState(initialMercenaryCount);
  const [isMercenaryUpdating, setIsMercenaryUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 초기 순서를 유지하기 위해 정렬된 데이터 생성 (생성 시점 또는 ID 기준)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      // ID 기준으로 정렬하여 일관된 순서 유지
      return a.id.localeCompare(b.id);
    });
  }, [data]);

  // 외부 클릭 감지
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
        // 특정 쿼리만 무효화하여 순서 유지
        queryClient.invalidateQueries({
          queryKey: ["scheduleAttendance", scheduleId, teamId],
        });
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
        alert(result.message);
        queryClient.invalidateQueries({
          queryKey: ["scheduleAttendance", scheduleId, teamId],
        });
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
      await addAttendances({ scheduleId, teamId, teamType });
      queryClient.invalidateQueries({
        queryKey: ["scheduleAttendance", scheduleId, teamId],
      });
      alert("팀원 업데이트가 완료되었습니다.");
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
        queryClient.invalidateQueries({
          queryKey: ["scheduleAttendance", scheduleId, teamId],
        });
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
        // 필요시 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: ["schedule", scheduleId],
        });
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

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 닫기 버튼 */}
      <header className="flex items-center justify-between px-4 h-16 shrink-0">
        <h1 className="text-2xl font-bold">팀원 명단</h1>
        <button
          type="button"
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          onClick={() => router.push(`/schedule/${scheduleId}?tab=attendance`)}
          aria-label="닫기"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="px-4">
        {/* 전체 참석처리, 팀원 업데이트 버튼 */}
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

        {/* 참석자 목록 */}
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

        {/* 용병 수 관리 섹션 */}
        <article className="flex items-center gap-4 py-3 border-t border-gray-100 min-h-16">
          <div className="flex items-center justify-center size-6 text-sm font-medium text-muted-foreground">
            {sortedData.length + 1}
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 grow">
            <div className="flex gap-2 items-center">
              <span className="font-semibold">용병</span>
              <span className="font-medium text-muted-foreground">
                경기에 참여 할 용병의 수
              </span>
            </div>
            <div className="flex items-center gap-2 sm:min-w-72 h-10 rounded-md bg-gray-100 p-0.5">
              <button
                type="button"
                disabled={isMercenaryUpdating || mercenaryCount <= 0}
                className="h-9 w-20 grow rounded-sm bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opaci ty-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                onClick={() => handleMercenaryCountChange(0)}
              >
                없음
              </button>
              {/* <button
                type="button"
                disabled={isMercenaryUpdating || mercenaryCount <= 0}
                className="size-9 rounded-sm bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handleMercenaryCountChange(0)}
              >
                0
              </button>
              <button
                type="button"
                disabled={isMercenaryUpdating || mercenaryCount <= 0}
                className="size-9 rounded-sm bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handleMercenaryCountChange(1)}
              >
                1
              </button>
              <button
                type="button"
                disabled={isMercenaryUpdating || mercenaryCount <= 0}
                className="size-9 rounded-sm bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handleMercenaryCountChange(2)}
              >
                2
              </button> */}
              <Separator orientation="vertical" className="!h-7 w-px" />
              <button
                type="button"
                disabled={isMercenaryUpdating || mercenaryCount <= 0}
                className="size-9 rounded-sm bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handleMercenaryCountChange(2)}
              >
                <Minus className="size-4.5 sm:size-4" />
              </button>
              <span className="min-w-[3rem] text-center font-semibold text-lg">
                {mercenaryCount}
              </span>
              <button
                type="button"
                disabled={isMercenaryUpdating}
                className="size-9 rounded-sm bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handleMercenaryCountChange(mercenaryCount + 1)}
              >
                <Plus className="size-4.5 sm:size-4" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ManageAttendanceContent;
