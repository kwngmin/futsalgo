"use client";

import { useQuery } from "@tanstack/react-query";
import { getScheduleAttendance } from "../actions/get-schedule-attendance";
import { Button } from "@/shared/components/ui/button";

const ScheduleAttendance = ({ scheduleId }: { scheduleId: string }) => {
  console.log(scheduleId, "scheduleId");

  const { data, isLoading, error } = useQuery({
    queryKey: ["scheduleAttendance", scheduleId],
    queryFn: () => getScheduleAttendance(scheduleId),
  });

  console.log(data, "data scheduleAttendance");
  console.log(isLoading, "isLoading");
  console.log(error, "error");

  const renderAttendance = ({ team }: { team: "host" | "invited" }) => {
    const hostAttendances = data?.data?.attendances.filter(
      (attendance) => attendance.teamType === "HOST"
    );

    const invitedAttendances = data?.data?.attendances.filter(
      (attendance) => attendance.teamType === "INVITED"
    );

    const attandances = team === "host" ? hostAttendances : invitedAttendances;

    return (
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div>{data?.data?.hostTeam?.name}</div>
          <div className="grid grid-cols-3 items-center gap-2 text-sm text-muted-foreground ">
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
          <div className="flex items-center justify-center h-32">
            참석자가 없습니다.
          </div>
        )}
        {data?.data?.manageableTeams.includes(team) && (
          <Button
            //   className="h-11 sm:h-10 flex items-center justify-center text-white bg-black rounded-md font-medium"
            size="lg"
            className="w-full"
            variant="secondary"
          >
            참석자 관리
          </Button>
          //   <div className="h-11 sm:h-10 flex items-center justify-center text-white bg-black rounded-md font-medium">
          //     참석자 관리
          //   </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {renderAttendance({ team: "host" })}
      {data?.data?.invitedTeam && renderAttendance({ team: "invited" })}
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
