"use client";

import { Clock, Vote } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ScheduleWithDetails } from "../home/actions/get-schedules";
import { calculateDday } from "../schedule/[id]/ui/ScheduleContent";

const ScheduleCard = ({ schedule }: { schedule: ScheduleWithDetails }) => {
  const router = useRouter();
  const session = useSession();

  // const timeRange = formatTimeRange({
  //   time: {
  //     start: schedule.startTime,
  //     end: schedule.endTime,
  //   },
  // });

  const dDay = calculateDday(schedule?.date as Date);

  const [period, time] = schedule?.startTime
    ?.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .split(" ");

  const handleScheduleClick = (scheduleId: string) => {
    router.push(`/schedule/${scheduleId}`);
  };

  return (
    <div
      className="space-y-2 sm:space-y-1 flex flex-col py-2 select-none"
      key={schedule.id}
    >
      <div
        className="flex px-4 gap-1 cursor-pointer"
        onClick={() => handleScheduleClick(schedule.id)}
      >
        <div className="font-medium flex items-center gap-2 truncate leading-none w-20 h-14 tracking-tight">
          {dDay > 1
            ? `D-${dDay}`
            : dDay === 1
            ? "내일"
            : dDay === 0
            ? "오늘"
            : schedule.startTime?.toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
              })}
          {/* {schedule.startTime?.toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          })} */}
        </div>
        <div className="grow flex flex-col justify-center">
          <h3 className="text-lg sm:text-base font-semibold flex items-center gap-2 truncate leading-none h-6">
            {schedule.place}
            <span className="text-sm font-medium text-indigo-600 mb-0.5">
              {schedule.matchType === "TEAM" ? "친선경기" : "연습경기"}
            </span>
          </h3>
          <div className="w-full sm:text-sm tracking-tight flex items-center gap-1 text-muted-foreground">
            <Clock className="size-4" />
            {`${schedule?.startTime?.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
      -
      ${schedule?.endTime?.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`}
          </div>
        </div>
      </div>

      {schedule.enableAttendanceVote && (
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
      )}

      {false ? (
        // {schedule.matchType !== "TEAM" ? (
        <div className="flex flex-col sm:flex-row sm:items-stretch border-t">
          <div
            className="relative sm:grow grid grid-cols-2 items-center gap-16 h-20 cursor-pointer bg-gray-50"
            onClick={() => handleScheduleClick(schedule.id)}
          >
            {/* 주최팀 */}
            <div className="flex flex-col items-end gap-2">
              {/* <div>HOME</div> */}
              <div className="flex items-center gap-1">
                <div className="sm:text-lg font-semibold">
                  {schedule.hostTeam.name}
                </div>
                {/* {schedule.hostTeam.logoUrl ? (
              <div className="size-7 sm:size-12">
                <Image
                  src={schedule.hostTeam.logoUrl}
                  alt={schedule.hostTeam.name}
                  width={48}
                  height={48}
                />
              </div>
            ) : (
              <div className="size-5 sm:size-6 bg-gray-200 rounded-full" />
            )} */}
                {/* <div>HOME</div> */}
              </div>
            </div>
            {/* 공통 */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
              <span className="h-4 flex items-center justify-center font-medium text-sm sm:text-base tracking-tight text-muted-foreground">
                {period}
              </span>
              <span className="h-5 sm:h-6 flex items-center justify-center font-semibold sm:text-lg tracking-tight">
                {time}
              </span>
              <div className="w-full flex flex-col items-center">
                {/* {schedule?.status === "PENDING" ? (
              <div>대기중</div>
            ) : schedule?.status === "REJECTED" ? (
              <div>거절됨</div>
            ) : schedule?.status === "READY" ? (
              <div
                className={`flex items-center gap-1 text-sm sm:text-lg font-medium tracking-tight ${
                  dDay > 0
                    ? "text-muted-foreground"
                    : "bg-green-600"
                }`}
              >
                {dDay > 1 ? (
                  schedule.startTime?.toLocaleDateString("ko-KR", {
               
                    month: "long",
                    day: "numeric",
                  })
                ) : dDay === 1 ? (
                  "내일"
                ) : dDay === 0 ? (
                  <Countdown date={schedule.startTime as Date} />
                ) : (
                  "경기 종료"
                )}
              </div>
            ) : schedule?.status === "PLAY" ? (
              <div>경기중</div>
            ) : (
              <div>경기 종료</div>
            )} */}
                {/* <span>
    {calculateDday(data.data.schedule?.date as Date) > 0
      ? `D-${calculateDday(data.data.schedule?.date as Date)}`
      : "D-day"}
  </span> */}
              </div>
              {/* <span>{timeRange}</span> */}
              {/* <span>
      {data?.data?.schedule?.date?.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </span>
    <span className="">{timeRange}</span> */}
              {/* <div className="h-16 flex items-center justify-center font-extrabold text-3xl text-muted-foreground">
      VS
    </div> */}
            </div>
            {/* 초청팀 */}
            <div className="flex flex-col gap-2">
              {/* <div>AWAY</div> */}
              <div className="flex items-center gap-1">
                {/* <div>AWAY</div> */}
                {/* {schedule.hostTeam.logoUrl ? (
              <div className="size-7 sm:size-12">
                <Image
                  src={schedule.hostTeam.logoUrl}
                  alt={schedule.hostTeam.name}
                  width={48}
                  height={48}
                />
              </div>
            ) : (
              <div className="size-6 bg-gray-200 rounded-full" />
            )} */}
                <div className="sm:text-lg font-semibold">
                  {schedule.hostTeam.name}
                </div>
                {/* <div>HOME</div> */}
              </div>
            </div>
          </div>
        </div>
      ) : (
        schedule.invitedTeam?.name
      )}

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
  );
};

export default ScheduleCard;
