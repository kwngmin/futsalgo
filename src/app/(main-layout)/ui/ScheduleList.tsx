"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarCheckIcon, HourglassHighIcon } from "@phosphor-icons/react";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { Fragment } from "react";
import { Separator } from "@/shared/components/ui/separator";

type ScheduleListProps = Prisma.ScheduleGetPayload<{
  include: {
    hostTeam: true;
    invitedTeam: true;
    attendances: true;
    createdBy: true;
    likes: true;
  };
}>;

const ScheduleList = ({
  schedule,
  myTeams,
}: {
  schedule: ScheduleListProps;
  myTeams?: string[];
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
    <div className="flex flex-col py-1.5 select-none">
      <div className="flex px-4 gap-3 cursor-pointer items-center">
        <div
          className={`size-14 rounded-2xl flex flex-col justify-center items-center truncate leading-none gap-0.5 bg-neutral-100/80 pb-1 z-10`}
        >
          <div className="font-medium text-xs text-gray-500">{weekday}</div>
          <div className="font-semibold">
            {`${schedule.date.getMonth() + 1}.${schedule.date.getDate()}`}
          </div>
        </div>
        <div
          className="grow flex flex-col justify-center"
          onClick={() => handleScheduleClick(schedule.id)}
        >
          <div className="flex items-center gap-1.5 truncate leading-none h-5 tracking-tight">
            <span className="text-gray-800 text-sm">{schedule.place}</span>
            <Separator
              orientation="vertical"
              className="!h-3 !w-0.25 bg-gray-300"
            />
            <span className="font-medium text-sm text-gray-600">
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
                <div className="size-4 rounded-full bg-gray-100" />
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

      {myTeams && schedule.status === "PENDING" ? (
        <div className="mx-4 flex justify-between items-center px-8 gap-2 bg-gradient-to-b from-transparent to-slate-100/80 rounded-b-xl border-b border-slate-300 mt-1 relative">
          <div className="absolute border-l border-b border-gray-300 left-3 w-3 h-6 bottom-4 rounded-bl-md" />
          {myTeams?.includes(schedule.hostTeamId) ? (
            <div className="h-9 flex items-center gap-2 text-sm">
              <HourglassHighIcon
                className="size-6 text-amber-700"
                weight="fill"
              />
              {/* <Separator
             orientation="vertical"
             className="!h-3 !w-0.25 bg-gray-300"
           /> */}
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
                {/* <span className="font-medium text-emerald-700">
                  {schedule.createdAt.toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                    // hour: "numeric",
                    // minute: "numeric",
                  })}
                </span> */}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {attendanceStatus &&
      attendanceStatus === "UNDECIDED" &&
      schedule.status === "READY" &&
      schedule.enableAttendanceVote &&
      schedule.attendanceDeadline &&
      schedule.attendanceDeadline > new Date() ? (
        <div className="mx-4 flex justify-between items-center px-8 gap-2 bg-gradient-to-b from-transparent to-slate-100/80 rounded-b-xl border-b border-slate-300 mt-1 relative">
          <div className="absolute border-l border-b border-gray-300 left-3 w-3 h-6 bottom-4 rounded-bl-md" />
          <div className="h-9 flex items-center gap-2 text-sm">
            <CalendarCheckIcon
              className="size-6 text-indigo-700"
              weight="fill"
            />

            {/* <Separator
              orientation="vertical"
              className="!h-3 !w-0.25 bg-gray-300"
            /> */}
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
