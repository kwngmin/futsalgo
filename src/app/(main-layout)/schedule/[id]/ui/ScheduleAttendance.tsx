"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getScheduleAttendance } from "../actions/get-schedule-attendance";
// import ManageAttendance from "./ManageAttendance";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AttendanceStatus } from "@prisma/client";
import { Label } from "@/shared/components/ui/label";
import { ChevronRight, UserCheck } from "lucide-react";

const ScheduleAttendance = ({ scheduleId }: { scheduleId: string }) => {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["scheduleAttendance", scheduleId],
    queryFn: () => getScheduleAttendance(scheduleId),
    placeholderData: keepPreviousData,
  });

  console.log(data, "data scheduleAttendance");
  console.log(isLoading, "isLoading");
  console.log(error, "error");

  const renderAttendance = ({ teamType }: { teamType: "host" | "invited" }) => {
    const hostAttendances = data?.data?.attendances.filter(
      (attendance) => attendance.teamType === "HOST"
    );

    const invitedAttendances = data?.data?.attendances.filter(
      (attendance) => attendance.teamType === "INVITED"
    );

    const attandances =
      teamType === "host" ? hostAttendances : invitedAttendances;

    const team =
      teamType === "host" ? data?.data?.hostTeam : data?.data?.invitedTeam;

    const getStatus = (attendance: AttendanceStatus) => {
      switch (attendance) {
        case "ATTENDING":
          return "참석";
        case "NOT_ATTENDING":
          return "불참";
        case "UNDECIDED":
          return "미정";
        default:
          return "미정";
      }
    };

    if (isLoading) {
      return (
        <div className="mt-4 px-4">
          <div className="h-12 rounded-md bg-neutral-100 animate-pulse" />
          <div className="h-[98px] rounded-2xl bg-neutral-100 animate-pulse my-2" />
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between h-12 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-4 w-20 bg-neutral-100 animate-pulse" />
              </div>
              <div className="h-4 w-16 bg-neutral-100 animate-pulse" />
            </div>
          ))}
        </div>
      );
    }

    const attendances = attandances?.filter(
      (attendance) => attendance.attendanceStatus === "ATTENDING"
    ).length;

    const notAttendances = attandances?.filter(
      (attendance) => attendance.attendanceStatus === "NOT_ATTENDING"
    ).length;

    const undecidedAttendances = attandances?.filter(
      (attendance) => attendance.attendanceStatus === "UNDECIDED"
    ).length;

    return (
      <div className="mt-4 px-4">
        <div className="bg-neutral-100 overflow-hidden rounded-2xl mb-2">
          {/* 팀 정보 */}
          <div
            className="w-full flex items-center justify-between px-4 h-12 border-b gap-3 cursor-pointer bg-neutral-50 hover:bg-neutral-200 transition-colors"
            onClick={() => {
              router.push(
                `/teams/${
                  teamType === "host"
                    ? data?.data?.hostTeam?.id
                    : data?.data?.invitedTeam?.id
                }`
              );
            }}
          >
            <div className="flex items-center gap-2">
              {team?.logoUrl ? (
                <Image
                  src={team?.logoUrl}
                  alt="team_logo"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
              ) : (
                <div className="size-6 rounded-lg bg-gray-200" />
              )}
              <span className="text-base font-medium">{team?.name ?? ""}</span>
            </div>
            <ChevronRight className="size-5 text-gray-400" />
          </div>

          {/* 참석 현황 */}
          <div className="grid grid-cols-4 gap-3 px-4 py-2 mb-2">
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">
                {attendances === 0 ? "없음" : `${attendances}명`}
              </div>
              <Label className="text-muted-foreground">참석</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">
                {notAttendances === 0 ? "없음" : `${notAttendances}명`}
              </div>
              <Label className="text-muted-foreground">불참</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">
                {undecidedAttendances === 0
                  ? "없음"
                  : `${undecidedAttendances}명`}
              </div>
              <Label className="text-muted-foreground">미정</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">0</div>
              <Label className="text-muted-foreground">용병</Label>
            </div>
          </div>
        </div>

        {attandances && attandances?.length > 0 ? (
          attandances.map((attendance) => (
            <div
              key={attendance.user.id}
              className="flex items-center justify-between h-12 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                {attendance.user.image ? (
                  <Image
                    src={attendance.user.image ?? ""}
                    alt="user_image"
                    width={32}
                    height={32}
                    className="rounded-full object-cover size-8"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-gray-200" />
                )}
                <span className="font-medium">{attendance.user.nickname}</span>
              </div>
              <span
                className={`font-medium mx-2 ${
                  attendance.attendanceStatus === "ATTENDING"
                    ? "text-emerald-600"
                    : attendance.attendanceStatus === "NOT_ATTENDING"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {getStatus(attendance.attendanceStatus)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            참석자가 없습니다.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {data?.data?.manageableTeams && (
        <div className="m-4">
          <button
            type="button"
            className="cursor-pointer rounded-md flex justify-center items-center gap-2 px-4 h-12 sm:h-11 font-semibold hover:bg-neutral-100 transition-colors bg-white border border-input shadow-xs hover:shadow-sm w-full"
            onClick={() => {
              router.push(
                `/schedule/${scheduleId}/attendances/${
                  data?.data?.manageableTeams.includes("host")
                    ? data?.data?.schedule?.hostTeamId
                    : data?.data?.manageableTeams.includes("invited")
                    ? data?.data?.schedule?.invitedTeamId
                    : null
                }`
              );
            }}
          >
            <UserCheck className="w-5 h-5 text-gray-600" />
            <span>참석자 관리</span>
          </button>
        </div>
      )}

      {renderAttendance({ teamType: "host" })}
      {data?.data?.invitedTeam && renderAttendance({ teamType: "invited" })}
    </div>
  );
};

export default ScheduleAttendance;
