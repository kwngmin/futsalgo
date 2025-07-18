"use client";

import { useQuery } from "@tanstack/react-query";
import { getScheduleAttendance } from "../actions/get-schedule-attendance";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

const ScheduleAttendance = ({ scheduleId }: { scheduleId: string }) => {
  console.log(scheduleId, "scheduleId");

  const { data, isLoading, error } = useQuery({
    queryKey: ["scheduleAttendance", scheduleId],
    queryFn: () => getScheduleAttendance(scheduleId),
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

    return (
      <div className="mt-4 px-4">
        <div className="rounded-md px-4 w-full flex items-center justify-between h-11 sm:h-10 gap-3 cursor-pointer bg-gray-50 transition-colors">
          <div className="flex items-center gap-1">
            <Image
              src={team?.logoUrl ?? ""}
              alt="avatar"
              width={24}
              height={24}
              className="rounded-lg"
            />
            <span className="text-base font-medium text-gray-500">
              {team?.name}
            </span>
          </div>
          {data?.data?.manageableTeams.includes(teamType) && (
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-500">
                등록 관리
              </span>
              <ChevronRight className="size-5 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground font-medium h-12 mt-3 px-1 border-b">
          <span className="text-center">닉네임</span>
          <div className="grid grid-cols-3 items-center gap-2 ">
            <span className="text-center">나이</span>
            <span className="text-center">키</span>
            <span className="text-center">성별</span>
          </div>
        </div>
        {attandances && attandances?.length > 0 ? (
          attandances.map((attendance) => (
            <div
              key={attendance.user.id}
              className="flex items-center justify-between"
            >
              <div>{attendance.user.nickname}</div>
              <div>{attendance.user.birthDate}</div>
              <div>{attendance.user.height}</div>
              <div>{attendance.user.gender}</div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            참석자가 없습니다.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderAttendance({ teamType: "host" })}
      {data?.data?.invitedTeam && renderAttendance({ teamType: "invited" })}
    </div>
  );
};

export default ScheduleAttendance;

{
  /* 주최팀&초청팀 탭 */
}
{
  /* <div className="space-y-3">
{data.data.schedule.matchType === "TEAM" && (
  <div className="mx-4 grid grid-cols-2 p-0.5 bg-gray-100 rounded-full">
    <div className="bg-white h-11 flex items-center justify-center border rounded-full shadow-xs font-medium">
      {data.data.schedule.hostTeam.name}
    </div>
    <div
      className=" h-11 flex items-center justify-center font-medium text-muted-foreground"
     
    >
      {data.data.schedule.invitedTeam?.name}
    </div>
  </div>
)} */
}
{
  /* 참석 현황 */
}
{
  /* <div className="border overflow-hidden mx-4 grid grid-cols-3 gap-3 bg-white rounded-2xl p-4">
  <div className="flex flex-col gap-1 items-center my-3">
    <div className="font-semibold">0</div>
    <Label className="text-muted-foreground">참석</Label>
  </div>
  <div className="flex flex-col gap-1 items-center my-3">
    <div className="font-semibold">0</div>
    <Label className="text-muted-foreground">불참</Label>
  </div>
  <div className="flex flex-col gap-1 items-center my-3">
    <div className="font-semibold">1</div>
    <Label className="text-muted-foreground">미정</Label>
  </div>
</div>

<div>
  {data.data.schedule.hostTeam.members.map((member) => (
    <div key={member.id} className="mx-4">
      {member.user.nickname}
    </div>
  ))}
</div>
</div> */
}
