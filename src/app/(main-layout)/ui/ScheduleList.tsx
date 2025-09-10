"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarCheckIcon } from "@phosphor-icons/react";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { Fragment } from "react";
import { Separator } from "@/shared/components/ui/separator";
import { Ban, Hourglass } from "lucide-react";

type ScheduleListProps = Prisma.ScheduleGetPayload<{
  include: {
    hostTeam: true;
    invitedTeam: true;
    attendances: true;
    createdBy: true;
    likes: true;
  };
}>;

// function isSameDate(date: Date | string): boolean {
//   const d1 = new Date(date);
//   const d2 = new Date();

//   return (
//     d1.getFullYear() === d2.getFullYear() &&
//     d1.getMonth() === d2.getMonth() &&
//     d1.getDate() === d2.getDate()
//   );
// }

const ScheduleList = ({
  schedule,
}: // myTeams,
{
  schedule: ScheduleListProps;
  // myTeams?: string[];
}) => {
  const router = useRouter();
  const session = useSession();
  const pathname = usePathname();
  // const queryClient = useQueryClient();
  // const dDay = calculateDday(schedule?.date as Date);

  const handleScheduleClick = (scheduleId: string) => {
    if (pathname === "/my-schedules") {
      router.push(`/schedule/${scheduleId}?tab=${pathname}`);
    } else {
      router.push(`/schedule/${scheduleId}`);
    }
  };

  // const handleLikeClick = async (scheduleId: string) => {
  //   const result = await likeSchedule({ scheduleId });
  //   console.log(result);
  //   if (result.success) {
  //     queryClient.invalidateQueries({ queryKey: ["schedules"] });
  //   } else {
  //     console.warn(result.error);
  //   }
  // };

  // const isLiked = schedule.likes.some(
  //   (like) => like.userId === session.data?.user?.id
  // );

  // const getDateStatus = (day: number) => {
  //   if (day > 1) {
  //     return {
  //       text: `D-${day}`,
  //       style: "bg-muted",
  //     };
  //   } else if (day === 1) {
  //     return { text: "내일", style: "bg-indigo-500/15 text-indigo-600" };
  //   } else if (day === 0) {
  //     return { text: "오늘", style: "bg-teal-500/15 text-teal-600" };
  //   }
  //   return {
  //     text: `${schedule.date.getMonth() + 1}.${schedule.date.getDate()}`,
  //     style: "bg-muted",
  //   };
  // };

  // const dateStatus = getDateStatus(dDay);

  const isAttendance = schedule.attendances.find(
    (attendance) => attendance.userId === session.data?.user?.id
  );

  const attendanceStatus = isAttendance ? isAttendance.attendanceStatus : null;
  const weekday = schedule.date.toLocaleDateString("ko-KR", {
    weekday: "long",
  });

  return (
    <div
      className="flex flex-col py-1.5 select-none hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group"
      onClick={() => handleScheduleClick(schedule.id)}
    >
      <div className="flex px-4 gap-3 items-center relative">
        {/* {isSameDate(schedule.date) && (
          <div className="absolute top-0 left-4 z-20 bg-red-600 rounded-full size-2 outline-2 outline-white" />
        )} */}
        <div
          className={`shrink-0 size-14 rounded-2xl flex flex-col justify-center items-center truncate leading-none gap-0.5 bg-neutral-100/80 group-hover:bg-white group-hover:shadow-lg group-hover:outline group-active:bg-white group-active:shadow-lg group-active:outline outline-gray-300 pb-1 z-10`}
        >
          <div className="font-medium text-xs text-gray-500">{weekday}</div>
          <div className="font-semibold">
            {`${schedule.date.getMonth() + 1}.${schedule.date.getDate()}`}
          </div>
        </div>
        <div className="grow flex flex-col justify-center overflow-hidden">
          <div className="flex items-center gap-1.5 leading-none h-5 tracking-tight">
            {(schedule.status === "PENDING" ||
              schedule.status === "REJECTED") && (
              <Fragment>
                <div
                  className={`shrink-0 flex items-center gap-0.5 font-medium text-sm rounded-full pb-px ${
                    schedule.status === "REJECTED"
                      ? "text-red-600"
                      : "text-amber-700"
                  }`}
                >
                  {schedule.status === "REJECTED" ? (
                    <Ban className="size-3" strokeWidth={2.25} />
                  ) : (
                    <Hourglass className="size-3" strokeWidth={2.25} />
                  )}
                  {schedule.status === "REJECTED" ? "거절됨" : "대기중"}
                </div>
                <Separator
                  orientation="vertical"
                  className="!h-3 !w-0.25 bg-gray-300"
                />
              </Fragment>
            )}
            <span className="text-gray-800 text-sm truncate whitespace-nowrap overflow-hidden">
              {schedule.place}
            </span>
            <Separator
              orientation="vertical"
              className="!h-3 !w-0.25 bg-gray-300"
            />
            <span className="font-medium text-sm text-gray-600 shrink-0">
              {schedule.startTime?.toLocaleTimeString("ko-KR", {
                hour: "numeric",
                minute: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              {schedule.hostTeam.logoUrl ? (
                <Image
                  src={schedule.hostTeam.logoUrl}
                  alt={schedule.hostTeam.name}
                  width={16}
                  height={16}
                  className="rounded-full"
                />
              ) : (
                <div className="size-4 rounded-full bg-gradient-to-br from-slate-300 to-gray-100" />
              )}
              <span className="font-semibold tracking-tight truncate">
                {schedule.hostTeam.name}
              </span>
            </div>
            {schedule.matchType === "TEAM" && (
              <Fragment>
                <span className="text-sm text-muted-foreground font-medium">
                  vs
                </span>
                <div className="flex items-center gap-1">
                  {schedule.invitedTeam?.logoUrl ? (
                    <Image
                      src={schedule.invitedTeam.logoUrl}
                      alt={schedule.invitedTeam.name}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="size-4 rounded-full bg-gray-100" />
                  )}
                  <span className="font-semibold tracking-tight truncate">
                    {schedule.invitedTeam?.name}
                  </span>
                </div>
              </Fragment>
            )}
          </div>
        </div>
      </div>

      {/* 친선전 대기 상태 */}
      {/* {myTeams && schedule.status === "PENDING" ? (
        <div className="mx-4 flex justify-between items-center pl-12 gap-2 relative">
          <div className="absolute border-l border-b border-gray-300 left-7 w-3 h-5 bottom-4 rounded-bl-sm" />
          {myTeams?.includes(schedule.hostTeamId) ? (
            <div className="h-9 flex items-center gap-2 text-sm">
              <HourglassHighIcon
                className="size-6 text-amber-700"
                weight="fill"
              />
              <div className="w-full flex items-center gap-1 tracking-tight text-sm">
                <span className="shrink-0 font-semibold text-sm">초청팀</span>
                응답을 기다리는 중 입니다.
              </div>
            </div>
          ) : (
            <div className="h-9 flex items-center gap-2 text-sm">
              <HourglassHighIcon
                className="size-6 text-amber-600"
                weight="fill"
              />
              <div className="w-full flex items-center gap-1 tracking-tight text-sm">
                <span>
                  <span className="shrink-0 font-semibold text-sm">친선전</span>
                  을
                </span>
                제안 받았습니다. 응답해주세요
              </div>
            </div>
          )}
        </div>
      ) : null} */}

      {/* 참석 투표 상태 */}
      {attendanceStatus &&
      attendanceStatus === "UNDECIDED" &&
      schedule.status === "READY" &&
      schedule.enableAttendanceVote &&
      schedule.attendanceDeadline &&
      schedule.attendanceDeadline > new Date() ? (
        <div className="mx-4 flex justify-between items-center pl-12 gap-2 relative">
          <div className="absolute border-l border-b border-gray-300 left-7 w-4 h-4 bottom-3 rounded-bl-sm" />
          <div className="h-7 flex items-center gap-1 text-sm px-1.5 rounded-sm group-hover:bg-white/50 group-active:bg-white/50">
            <CalendarCheckIcon
              className="size-4.5 text-indigo-700"
              weight="fill"
            />
            <div className="w-full flex items-center gap-1 tracking-tight text-sm">
              <span>
                <span className="font-medium text-indigo-700">
                  {new Date(
                    schedule.attendanceDeadline as Date
                  ).toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                까지
              </span>
              <span>
                <span className="shrink-0 font-semibold text-sm">참석여부</span>
                를
              </span>
              선택해주세요.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ScheduleList;
