"use client";

import { useQuery } from "@tanstack/react-query";
import { getScheduleAttendance } from "../actions/get-schedule-attendance";
import ManageAttendance from "./ManageAttendance";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AttendanceStatus } from "@prisma/client";

const ScheduleAttendance = ({ scheduleId }: { scheduleId: string }) => {
  const router = useRouter();

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

    return (
      <div className="mt-4 px-4">
        {data?.data?.manageableTeams.includes(teamType) ? (
          <ManageAttendance
            logoUrl={team?.logoUrl ?? ""}
            name={team?.name ?? ""}
            isManageableTeam
            onClick={() => {
              router.push(
                `/schedule/${scheduleId}/attendances/${
                  teamType === "host"
                    ? data?.data?.schedule?.hostTeamId
                    : data?.data?.schedule?.invitedTeamId
                }`
              );
            }}
          />
        ) : (
          <ManageAttendance
            logoUrl={team?.logoUrl ?? ""}
            name={team?.name ?? ""}
          />
        )}
        <div className="flex items-center mt-2 justify-between text-sm text-muted-foreground font-medium h-12 px-1 border-b mb-2">
          <span className="text-center">팀원 닉네임</span>
          <span className="text-center">참석 여부</span>
        </div>
        {attandances && attandances?.length > 0 ? (
          attandances.map((attendance) => (
            <div
              key={attendance.user.id}
              className="flex items-center justify-between h-11 border-b border-gray-200 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                {attendance.user.image ? (
                  <Image
                    src={attendance.user.image ?? ""}
                    alt="user_image"
                    width={24}
                    height={24}
                    className="rounded-full object-cover size-6"
                  />
                ) : (
                  <div className="size-6 rounded-full bg-gray-200" />
                )}
                <span className="font-medium">{attendance.user.nickname}</span>
              </div>
              <span className="font-medium text-muted-foreground">
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
