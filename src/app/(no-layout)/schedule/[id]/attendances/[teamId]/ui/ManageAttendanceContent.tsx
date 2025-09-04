"use client";

import { AttendanceStatus, Prisma } from "@prisma/client";
import { Minus, RefreshCcw, SquareCheckBig, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { addAttendances } from "../actions/add-attendances";
import { updateAttendance } from "../actions/update-attendance";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { updateAllAttendanceStatus } from "../actions/update-all-attendace-status";
import { removeAttendance } from "../actions/remove-attendance";

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

const ManageAttendanceContent = ({
  scheduleId,
  data,
  teamId,
  teamType,
}: {
  scheduleId: string;
  data: AttendanceWithUser[];
  teamId: string;
  teamType: "HOST" | "INVITED";
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showAllAttendanceMenu, setShowAllAttendanceMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        queryClient.invalidateQueries({ queryKey: ["scheduleAttendance"] });
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
    const statusText =
      attendanceStatus === "ATTENDING"
        ? "참석"
        : attendanceStatus === "NOT_ATTENDING"
        ? "불참"
        : "미정";

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
        queryClient.invalidateQueries({ queryKey: ["scheduleAttendance"] });
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
    // if (!confirm("팀원 명단을 업데이트하시겠습니까?")) {
    //   return;
    // }

    try {
      setIsLoading(true);
      await addAttendances({ scheduleId, teamId, teamType });
      queryClient.invalidateQueries({ queryKey: ["scheduleAttendance"] });
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
        queryClient.invalidateQueries({ queryKey: ["scheduleAttendance"] });
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

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <h1 className="text-2xl font-bold">팀원 명단</h1>
        <div className="flex items-center gap-2">
          <button
            className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            onClick={() =>
              router.push(`/schedule/${scheduleId}?tab=attendance`)
            }
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
      <div className="px-4">
        {/* 전체 참석처리, 팀원 업데이트 */}
        <div className="grid grid-cols-2 gap-2 sm:max-w-2/3">
          {/* 드롭다운 메뉴 */}
          {/* <div className="relative" ref={dropdownRef}>
            <div
              className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowAllAttendanceMenu(!showAllAttendanceMenu)}
            >
              <div className="flex items-center gap-2">
                <SquareCheckBig className="size-5 text-gray-400" />
                <span className="text-base font-medium text-center">
                  전체 참석처리
                </span>
              </div>
              <ChevronDown className="size-4 text-gray-600" />
            </div>
            {showAllAttendanceMenu && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-400 rounded-md shadow-lg z-10">
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleUpdateAll("ATTENDING")}
                >
                  전체 참석
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleUpdateAll("NOT_ATTENDING")}
                >
                  전체 불참
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 last:rounded-b-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleUpdateAll("UNDECIDED")}
                >
                  전체 미정
                </button>
              </div>
            )}
          </div> */}
          <div
            className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleUpdateAll("ATTENDING")}
          >
            <div className="flex items-center gap-2">
              <SquareCheckBig className="size-5 text-gray-400" />
              <span className="text-base font-medium">전체 참석처리</span>
            </div>
          </div>
          <div
            className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUpdateAttendances}
          >
            <div className="flex items-center gap-2">
              <RefreshCcw className="size-5 text-gray-400" />
              <span className="text-base font-medium">팀원 업데이트</span>
            </div>
          </div>
        </div>
        {/* 참석자 목록 */}
        <div className="mt-4">
          {data.map((attendance, index) => (
            <div
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
                    <div
                      className={`text-sm rounded-sm flex items-center justify-center h-9 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        attendance.attendanceStatus === "ATTENDING"
                          ? "bg-white border border-gray-300 shadow-xs font-semibold text-emerald-600"
                          : "text-muted-foreground font-medium"
                      }`}
                      onClick={() =>
                        !isLoading &&
                        handleUpdate({
                          attendanceId: attendance.id,
                          attendanceStatus: "ATTENDING",
                        })
                      }
                    >
                      참석
                    </div>
                    <div
                      className={`text-sm rounded-sm flex items-center justify-center h-9 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        attendance.attendanceStatus === "NOT_ATTENDING"
                          ? "bg-white border border-gray-300 shadow-xs font-semibold text-destructive"
                          : "text-muted-foreground font-medium"
                      }`}
                      onClick={() =>
                        !isLoading &&
                        handleUpdate({
                          attendanceId: attendance.id,
                          attendanceStatus: "NOT_ATTENDING",
                        })
                      }
                    >
                      불참
                    </div>
                    <div
                      className={`text-sm rounded-sm flex items-center justify-center h-9 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        attendance.attendanceStatus === "UNDECIDED"
                          ? "bg-white border border-gray-300 shadow-xs font-semibold"
                          : "text-muted-foreground font-medium"
                      }`}
                      onClick={() =>
                        !isLoading &&
                        handleUpdate({
                          attendanceId: attendance.id,
                          attendanceStatus: "UNDECIDED",
                        })
                      }
                    >
                      미정
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-center size-10 bg-destructive/5 rounded-md sm:hover:bg-destructive/10 transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    onClick={() =>
                      !isLoading &&
                      handleRemoveAttendance(
                        attendance.id,
                        attendance.user.nickname!
                      )
                    }
                  >
                    <Minus className="size-4.5 sm:size-4 text-destructive" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageAttendanceContent;
