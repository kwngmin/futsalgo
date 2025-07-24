"use client";

import { Vote } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { calculateDday } from "../schedule/[id]/ui/ScheduleContent";
import formatTimeRange from "@/entities/schedule/lib/format-time-range";
import { HeartIcon } from "@phosphor-icons/react";
import { likeSchedule } from "../actions/like-schedule";
import { useQueryClient } from "@tanstack/react-query";
import { Prisma } from "@prisma/client";

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

  const timeRange = formatTimeRange({
    time: {
      start: schedule.startTime,
      end: schedule.endTime,
    },
  });

  // const [period, time] = schedule?.startTime
  //   ?.toLocaleTimeString("ko-KR", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   })
  //   .split(" ");

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
        style: "bg-gradient-to-br from-slate-200/80 to-zinc-100/50 text-[15px]",
      };
    } else if (day === 1) {
      return { text: "내일", style: "bg-sky-600" };
    } else if (day === 0) {
      return { text: "오늘", style: "bg-teal-600" };
    }
    return {
      text: `${schedule.date.getMonth() + 1}.${schedule.date.getDate()}`,
      style: "bg-gradient-to-br from-muted to-muted/30",
    };
  };

  const dateStatus = getDateStatus(dDay);

  return (
    <div className="space-y-2 sm:space-y-1 flex flex-col py-2 select-none">
      <div className="flex px-4 gap-2 cursor-pointer">
        <div className="size-14 rounded-2xl font-medium flex items-center justify-center gap-2 truncate leading-none tracking-tight bg-gradient-to-br from-slate-200/50 to-slate-50">
          {dateStatus.text}
        </div>
        <div
          className="grow flex flex-col justify-center"
          onClick={() => handleScheduleClick(schedule.id)}
        >
          <div className="flex items-center gap-2">
            {/* <CourtBasketballIcon className="size-5" /> */}
            {schedule.matchType === "TEAM" ? (
              <span className="font-medium text-indigo-700">친선전</span>
            ) : (
              <span className="font-medium text-emerald-600">자체전</span>
            )}
            <div className="sm:text-sm tracking-tighter flex items-center gap-1 text-muted-foreground font-medium">
              {timeRange}
            </div>
          </div>
          <h3 className="text-lg sm:text-base font-semibold flex items-center gap-2 truncate leading-none h-6">
            {schedule.place}
          </h3>
        </div>
        <div
          className="flex items-center justify-center gap-2 rounded-lg w-10 h-14 group"
          onClick={() => handleLikeClick(schedule.id)}
        >
          <HeartIcon
            className={`size-6 group-hover:animate-ping absolute ${
              isLiked ? "text-indigo-600" : "text-zinc-200"
            }`}
            weight="fill"
          />
          <HeartIcon
            className={`size-6 group-hover: ${
              isLiked ? "text-indigo-600" : "text-zinc-200"
            }`}
            weight="fill"
          />
        </div>
      </div>

      {schedule.enableAttendanceVote ? (
        <div className="flex flex-col sm:flex-row items-center px-4 gap-2">
          <div
            className="font-medium w-full h-11 sm:h-10 flex items-center gap-3 bg-slate-100 rounded-lg px-4"
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
              <button className="grow h-11 sm:h-10 font-semibold text-blue-600 bg-blue-600/5 hover:bg-blue-600/10 rounded-lg">
                참석
              </button>
              <button className="grow h-11 sm:h-10 font-medium text-destructive bg-red-600/5 hover:bg-red-600/10 rounded-lg">
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
