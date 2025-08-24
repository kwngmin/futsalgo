"use client";

import { Vote } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { calculateDday } from "../schedule/[id]/ui/ScheduleContent";
import { HeartIcon } from "@phosphor-icons/react";
import { likeSchedule } from "../actions/like-schedule";
import { useQueryClient } from "@tanstack/react-query";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { Fragment } from "react";

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
  const queryClient = useQueryClient();
  const dDay = calculateDday(schedule?.date as Date);

  const handleScheduleClick = (scheduleId: string) => {
    router.push(`/schedule/${scheduleId}`);
  };

  const handleLikeClick = async (scheduleId: string) => {
    const result = await likeSchedule({ scheduleId });
    console.log(result);
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      // toast.success(result.message);
    } else {
      console.warn(result.error);
      // toast.error(result.error);
    }
  };

  const isLiked = schedule.likes.some(
    (like) => like.userId === session.data?.user?.id
  );

  const getDateStatus = (day: number) => {
    if (day > 1) {
      return {
        text: `D-${day}`,
        // style: "bg-slate-500/15 text-slate-600",
        style: "bg-muted",
      };
    } else if (day === 1) {
      return { text: "내일", style: "bg-indigo-500/15 text-indigo-600" };
    } else if (day === 0) {
      return { text: "오늘", style: "bg-teal-500/15 text-teal-600" };
    }
    return {
      text: `${schedule.date.getMonth() + 1}.${schedule.date.getDate()}`,
      style: "bg-muted",
    };
  };

  const dateStatus = getDateStatus(dDay);

  return (
    <div className="space-y-2 sm:space-y-1 flex flex-col py-2 select-none">
      <div className="flex px-4 gap-3 cursor-pointer">
        <div
          className={`size-14 rounded-2xl font-semibold flex flex-col items-center truncate gap-1.5 leading-none tracking-tight bg-neutral-50`}
        >
          <div
            className={`w-full text-xs px-1.5 sm:px-1 flex items-center justify-center h-5.5 ${
              schedule.matchType === "TEAM"
                ? "text-indigo-600 bg-indigo-600/10"
                : "text-emerald-600 bg-emerald-600/10"
            }`}
          >
            {schedule.matchType === "TEAM" ? "친선전" : "자체전"}
          </div>
          <div>{dateStatus.text}</div>
        </div>
        <div
          className="grow flex flex-col gap-0.5 justify-center"
          onClick={() => handleScheduleClick(schedule.id)}
        >
          <h3 className="flex items-center gap-2 truncate leading-none h-6 tracking-tight">
            <span className="font-semibold text-lg sm:text-base">
              {schedule.startTime?.toLocaleTimeString("ko-KR", {
                hour: "numeric",
                minute: "numeric",
              })}
            </span>
            {/* <span className="text-gray-400 font-medium">•</span> */}
            <span className="sm:text-sm font-medium">{schedule.place}</span>
          </h3>
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
              <span className="text-sm font-medium tracking-tight text-gray-600">
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
                  <span className="text-sm font-medium tracking-tight text-gray-600">
                    {schedule.invitedTeam?.name}
                  </span>
                </div>
              </Fragment>
            )}
          </div>
        </div>

        <div
          className="hidden flex items-center justify-center gap-2 rounded-lg w-10 h-14 group"
          onClick={() => handleLikeClick(schedule.id)}
        >
          <HeartIcon
            className={`size-6 group-hover: ${
              isLiked
                ? "text-indigo-600"
                : "text-zinc-300 group-hover:text-zinc-400"
            }`}
            weight="fill"
          />
        </div>
      </div>

      {schedule.enableAttendanceVote ? (
        <div className="flex flex-col sm:flex-row items-center px-4 gap-2">
          <div
            className="font-medium w-full h-12 sm:h-11 flex items-center gap-3 bg-slate-100 rounded-lg px-4"
            onClick={() => handleScheduleClick(schedule.id)}
          >
            <Vote className="size-5 text-muted-foreground" />
            <span className="font-medium">참석여부</span>
            <span className="text-sm text-muted-foreground">
              7월 11일 오전 10:00까지
            </span>
            {/* <span className="text-sm font-medium">미참여</span> */}
          </div>
          {schedule.attendances
            .map((attendance) => attendance.userId)
            .includes(session.data?.user?.id ?? "") ? (
            <div>hello</div>
          ) : (
            <div className="w-full sm:w-48 shrink-0 flex items-center *:cursor-pointer gap-1">
              <button className="grow h-12 sm:h-11 font-semibold text-blue-600 bg-blue-600/5 hover:bg-blue-600/10 rounded-lg">
                참석
              </button>
              <button className="grow h-12 sm:h-11 font-medium text-destructive bg-red-600/5 hover:bg-red-600/10 rounded-lg">
                불참
              </button>
            </div>
          )}
        </div>
      ) : null}
      {/* ) : (
        <div className="bg-slate-50 rounded-md h-9 text-sm text-muted-foreground font-medium mx-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">{`3경기 • 댓글 2개`}</div>
          <div className="flex items-center gap-2">
            <BookmarkIcon className="size-5" strokeWidth={2} />
          </div>
        </div>
      )} */}

      {/* 참가 여부 */}
      {/* <div className="px-4 flex h-11 justify-between items-center gap-4">
    <div className="flex items-center gap-4">
      <div className="text-sm font-medium flex items-center gap-1">
        <Circle className="size-4" strokeWidth={2.5} />
        참가 0
      </div>
      <div className="text-sm font-medium flex items-center gap-1">
        <X
          className="size-4 scale-[1.3] flex items-center justify-center"
          strokeWidth={2}
        />{" "}
        불참 0
      </div>
      <div className="text-sm font-medium flex items-center gap-1">
        <Clock className="size-4" strokeWidth={2.5} />
        미정 0
      </div>
    </div>
    <div className="text-sm font-medium flex items-center gap-1">
      결정완료
    </div>
  </div> */}
    </div>
    // <div className="bg-slate-50 rounded-md h-9 text-sm text-muted-foreground font-medium mx-4 px-4 flex justify-between items-center">
    //   <div className="flex items-center gap-2">{`3경기 • 댓글 2개`}</div>
    //   <div className="flex items-center gap-2">
    //     <BookmarkIcon className="size-5" strokeWidth={2} />
    //   </div>
    // </div>
  );
};

export default ScheduleCard;
