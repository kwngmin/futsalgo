"use client";

import Image from "next/image";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getScheduleAttendance } from "../actions/get-schedule-attendance";
import { useRouter } from "next/navigation";
import { AttendanceStatus } from "@prisma/client";
import { Label } from "@/shared/components/ui/label";
import { ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { useSession } from "next-auth/react";
import { UsersIcon } from "@phosphor-icons/react";

const ScheduleAttendance = ({ scheduleId }: { scheduleId: string }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

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
        <div className="">
          {/* <div className="h-12 rounded-md bg-neutral-100 animate-pulse" /> */}
          <div className="h-[138px] rounded-2xl bg-neutral-100 animate-pulse my-2" />
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
      <div className="">
        <div className="bg-neutral-100 overflow-hidden rounded-2xl mb-2">
          {/* 팀 정보 */}
          <div className="w-full flex items-center justify-between px-4 h-12 border-b gap-3 bg-neutral-50">
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
              <div className="flex items-center gap-2">
                <span
                  className="text-base font-medium hover:underline underline-offset-2 cursor-pointer"
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
                  {team?.name ?? ""}
                </span>
                <Separator
                  orientation="vertical"
                  className="!h-4 !bg-gray-300"
                />
                <span className="text-base font-medium text-gray-500">
                  {teamType === "host" ? "주최팀" : "초청팀"}
                </span>
              </div>
            </div>
            {/* <ChevronRight className="size-5 text-gray-400" /> */}
          </div>

          {/* 참석 현황 */}
          <div className="grid grid-cols-4 gap-3 px-4 py-2 mb-2">
            <div className="flex flex-col gap-1 items-center my-2">
              <div className="font-semibold">
                {attendances === 0 ? "-" : `${attendances}`}
              </div>
              <Label className="text-muted-foreground">참석</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-2">
              <div className="font-semibold">
                {notAttendances === 0 ? "-" : `${notAttendances}`}
              </div>
              <Label className="text-muted-foreground">불참</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-2">
              <div className="font-semibold">
                {undecidedAttendances === 0 ? "-" : `${undecidedAttendances}`}
              </div>
              <Label className="text-muted-foreground">미정</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-2">
              <div className="font-semibold">-</div>
              <Label className="text-muted-foreground">용병</Label>
            </div>
          </div>
        </div>

        {
          attandances && attandances?.length > 0
            ? data?.data?.attendances.some(
                (attendance) => attendance.user.id === currentUserId
              )
              ? attandances.map((attendance) => (
                  <div
                    key={attendance.user.id}
                    className="flex items-center justify-between h-12 border-b border-gray-100 last:border-b-0 select-none px-4"
                  >
                    <div
                      className="flex items-center gap-2"
                      onClick={() => {
                        router.push(`/players/${attendance.user.id}`);
                      }}
                    >
                      {attendance.user.image ? (
                        <Image
                          src={attendance.user.image ?? ""}
                          alt="user_image"
                          width={32}
                          height={32}
                          className="rounded-full object-cover size-8 border"
                        />
                      ) : (
                        <div className="size-8 rounded-full bg-gray-200" />
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium hover:underline underline-offset-2 cursor-pointer">
                          {attendance.user.nickname}
                        </span>
                        <span className="text-sm font-medium text-gray-500">
                          {attendance.user.name}
                          {/* {`• ${attendance.user.name}`} */}
                        </span>
                      </div>
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
              : null
            : null
          // (
          //   <div className="flex items-center justify-center h-40 text-muted-foreground">
          //     참석자가 없습니다.
          //   </div>
          // )
        }
      </div>
    );
  };

  return (
    <div className="px-4">
      <div className="flex justify-between items-center py-2 min-h-14 sm:min-h-12">
        <div className="flex items-center gap-2">
          <UsersIcon //
            // weight="fill"
            weight="light"
            className="size-6 text-gray-800"
          />
          <h2 className="text-lg font-semibold ">참석인원</h2>
        </div>
        {/* 경기 추가 버튼 */}
        {data?.data?.manageableTeams &&
          data?.data?.manageableTeams.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-base sm:text-sm font-semibold rounded-full gap-1.5 text-slate-700"
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
              {/* <Settings className="size-4" strokeWidth={2.5} /> */}
              관리
              <ChevronRight className="size-4" strokeWidth={2.5} />
            </Button>
          )}
      </div>

      <div
        className={
          data?.data?.invitedTeam
            ? "grid sm:grid-cols-2 gap-4 space-y-4 sm:space-y-0"
            : ""
        }
      >
        {renderAttendance({ teamType: "host" })}
        {data?.data?.invitedTeam && renderAttendance({ teamType: "invited" })}
      </div>
    </div>
  );
};

export default ScheduleAttendance;
