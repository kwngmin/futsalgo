"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// import { calculateDday } from "../schedule/[id]/ui/ScheduleContent";
import { CalendarCheckIcon } from "@phosphor-icons/react";
// import { likeSchedule } from "../actions/like-schedule";
// import { useQueryClient } from "@tanstack/react-query";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { Fragment } from "react";
import { Separator } from "@/shared/components/ui/separator";

type ScheduleCardProps = Prisma.ScheduleGetPayload<{
  include: {
    hostTeam: true;
    invitedTeam: true;
    attendances: true;
    createdBy: true;
    likes: true;
  };
}>;

const ScheduleCard = ({ schedule }: { schedule: ScheduleCardProps }) => {
  const router = useRouter();
  const session = useSession();
  // const queryClient = useQueryClient();
  // const dDay = calculateDday(schedule?.date as Date);

  const handleScheduleClick = (scheduleId: string) => {
    router.push(`/schedule/${scheduleId}`);
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
    <div className="space-y-2 sm:space-y-1 flex flex-col py-2 select-none">
      <div className="flex px-4 gap-3 cursor-pointer items-center">
        <div
          className={`size-14 rounded-2xl flex flex-col justify-center items-center truncate leading-none gap-0.75 bg-neutral-50 pb-1.5`}
        >
          <div className="font-medium text-xs text-slate-500">{weekday}</div>
          <div className="font-medium">
            {/* {dateStatus.text} */}
            {`${schedule.date.getMonth() + 1}.${schedule.date.getDate()}`}
            {/* {schedule.date.toLocaleString("ko-KR", {
              month: "long",
              day: "numeric",
            })} */}
            {/* {schedule.startTime?.toLocaleDateString("ko-KR", {
              month: "long",
              day: "long",
            })} */}
          </div>
        </div>
        <div
          className="grow flex flex-col justify-center"
          onClick={() => handleScheduleClick(schedule.id)}
        >
          <div className="flex items-center gap-2 truncate leading-none h-6 tracking-tight sm:text-sm">
            <span className="font-medium">
              {schedule.startTime?.toLocaleTimeString("ko-KR", {
                hour: "numeric",
                minute: "numeric",
              })}
            </span>
            <Separator
              orientation="vertical"
              className="!h-3 !w-0.25 bg-gray-400"
            />
            {/* <span className="text-gray-400 font-medium">•</span> */}
            <span className="">{schedule.place}</span>
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
                <div className="size-4 rounded-full bg-gray-100" />
              )}
              <span className="sm:text-sm font-medium tracking-tight truncate">
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
                  <span className="sm:text-sm font-medium tracking-tight truncate">
                    {schedule.invitedTeam?.name}
                  </span>
                </div>
              </Fragment>
            )}
          </div>
        </div>
      </div>

      {attendanceStatus &&
      schedule.status === "READY" &&
      schedule.enableAttendanceVote &&
      schedule.attendanceDeadline &&
      schedule.attendanceDeadline > new Date() ? (
        <div className="mx-4 flex justify-between items-center px-2 sm:px-4 py-1 sm:py-0 gap-2 bg-gradient-to-b from-transparent to-slate-50 rounded-b-xl border-y border-slate-100">
          <div
            className="h-9 sm:h-8 flex items-center gap-2 text-sm"
            // onClick={() => handleScheduleClick(schedule.id)}
          >
            <div className="p-2 rounded-full bg-white border border-slate-100 sm:border-none sm:p-0 sm:bg-transparent">
              <CalendarCheckIcon
                className="size-4.5 text-indigo-700"
                weight="fill"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-x-2 text-xs sm:text-sm">
              <span className="shrink-0 font-semibold">참석여부</span>
              <div className="w-full flex items-center gap-1 tracking-tight">
                <span className="font-medium text-indigo-700">
                  {new Date(
                    schedule.attendanceDeadline as Date
                  ).toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                  까지
                </span>
                선택해주세요.
              </div>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-medium text-amber-700">
            {attendanceStatus === "ATTENDING"
              ? "참석"
              : attendanceStatus === "NOT_ATTENDING"
              ? "불참"
              : "선택 안 함"}
          </span>
        </div>
      ) : //   <div className="mx-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-100 rounded-2xl p-3 sm:px-4 select-none">
      //   <div className="flex items-center gap-2">
      //     <div className="p-2 rounded-full bg-white/80">
      //       <CalendarCheckIcon
      //         className="size-6 text-indigo-700"
      //         weight="fill"
      //       />
      //     </div>
      //     <div className="flex flex-col">
      //       <span className="font-medium">경기일정 참석여부</span>
      //       <div className="w-full flex items-center gap-1 tracking-tight text-sm ">
      //         {/* <Timer className="size-5 text-amber-600" /> */}
      //         <span className="font-semibold text-indigo-700">
      //           {new Date(
      //             schedule.attendanceDeadline as Date
      //           ).toLocaleDateString("ko-KR", {
      //             month: "long",
      //             day: "numeric",
      //             hour: "numeric",
      //             minute: "numeric",
      //           })}
      //         </span>
      //         선택해주세요.
      //       </div>
      //     </div>
      //   </div>
      //   <div className="w-full sm:w-48 shrink-0 flex items-center *:cursor-pointer gap-1.5 ">
      //     <button className="grow h-11 sm:h-9 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-800 rounded-sm active:scale-95 transition-all duration-200">
      //       참석
      //     </button>
      //     <button className="grow h-11 sm:h-9 font-medium text-gray-700 bg-blue-900/10 hover:bg-red-600/10 hover:text-destructive rounded-sm active:scale-95 transition-all duration-200">
      //       불참
      //     </button>
      //   </div>
      // </div>
      null}
    </div>
  );
};

export default ScheduleCard;
