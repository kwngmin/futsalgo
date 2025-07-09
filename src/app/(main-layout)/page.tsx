"use client";

import { getSchedules } from "@/app/(main-layout)/home/actions/get-schedules";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPinSimpleIcon } from "@phosphor-icons/react";
// import formatTimeRange from "@/entities/schedule/lib/format-time-range";
// import { calculateDday } from "./schedule/[id]/ui/ScheduleContent";
// import { Countdown } from "./schedule/[id]/ui/CountDown";

const HomePage = () => {
  const router = useRouter();
  const session = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["schedules"],
    queryFn: getSchedules,
    placeholderData: keepPreviousData,
    enabled: !!session.data?.user?.id,
  });

  console.log(data, "data");
  console.log(isLoading, "isLoading");
  console.log(error, "error");

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-6 h-16 shrink-0">
        <h1 className="text-2xl font-bold">홈</h1>
        {/* <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
          <Search className="w-5 h-5" />
        </button> */}
      </div>
      {/* MatchesPage */}
      <div className="px-4 space-y-3">
        {session.data && (
          <div className="text-center py-8 bg-gray-200 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900">
              {/* 원활한 서비스 이용을 위해 로그인이 필요합니다 */}
            </h3>
            <div className="flex gap-2 justify-center">
              {/* <div className="flex gap-2 justify-center mt-3"> */}
              <button
                className="text-base bg-black text-white px-6 min-w-28 py-1.5 rounded-full font-bold cursor-pointer"
                onClick={() => router.push("/schedule/new")}
              >
                경기일정 추가
              </button>
            </div>
          </div>
        )}
        {data?.data?.hostSchedules.map((schedule) => {
          // const timeRange = formatTimeRange({
          //   time: {
          //     start: schedule.startTime,
          //     end: schedule.endTime,
          //   },
          // });
          // const dDay = calculateDday(schedule?.date as Date);
          const [period, time] = schedule?.startTime
            ?.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })
            .split(" ");

          return (
            <div
              className="overflow-hidden bg-white rounded-2xl border"
              key={schedule.id}
            >
              <div
                className="cursor-pointer"
                onClick={() => router.push(`/schedule/${schedule.id}`)}
              >
                <div className="flex items-center h-10 border-b border-gray-100 px-3 bg-gray-50">
                  <MapPinSimpleIcon
                    className="text-gray-600 mr-2"
                    size={20}
                    weight="fill"
                  />
                  <span className="text-sm font-semibold">
                    {schedule.place}
                  </span>
                </div>

                {schedule.matchType !== "TEAM" ? (
                  <div className="grid grid-cols-2 items-center gap-16 h-20 relative">
                    <div className="flex flex-col items-end gap-2">
                      {/* <div>HOME</div> */}
                      <div className="flex items-center gap-1">
                        <div className="sm:text-lg font-semibold">
                          {schedule.hostTeam.name}
                        </div>
                        {schedule.hostTeam.logoUrl ? (
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
                        )}
                        {/* <div>HOME</div> */}
                      </div>
                    </div>
                    {/* <div className="font-bold">VS</div> */}
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
                    <div className="flex flex-col gap-2">
                      {/* <div>AWAY</div> */}
                      <div className="flex items-center gap-1">
                        {/* <div>AWAY</div> */}
                        {schedule.hostTeam.logoUrl ? (
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
                        )}
                        <div className="sm:text-lg font-semibold">
                          {schedule.hostTeam.name}
                        </div>
                        {/* <div>HOME</div> */}
                      </div>
                    </div>
                  </div>
                ) : (
                  schedule.guestTeam?.name
                )}
                {/* <div className="w-full flex justify-center">
                  <div className="flex items-center mb-4 rounded-full !font-medium text-sm text-muted-foreground px-3 h-6">
                    {`${schedule.place}`}
                  </div>
                </div> */}
              </div>

              {schedule.attendances
                .map((attendance) => attendance.userId)
                .includes(session.data?.user?.id ?? "") ? (
                <div>hello</div>
              ) : (
                <div className="w-full grid grid-cols-2 border-t h-12 *:cursor-pointer *:font-medium">
                  <button className="!font-semibold text-blue-600 hover:bg-blue-600/5">
                    참가
                  </button>
                  <button className="text-destructive border-l  hover:bg-red-600/5">
                    불참
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {/* {data?.data?.guestSchedules.map((schedule) => (
          <div key={schedule.id}>{schedule.title}</div>
        ))} */}
      </div>
      {/* <Popover>
        <PopoverTrigger className="fixed bottom-20 lg:bottom-6 right-6 flex items-center justify-center bg-indigo-500 rounded-full">
          <div className="size-14 flex items-center justify-center bg-indigo-500 rounded-full">
            <Plus className="size-6 text-white" />
          </div>
          <span className="hidden lg:flex text-white">일정</span>
        </PopoverTrigger>
        <PopoverContent>Place content for the popover here.</PopoverContent>
      </Popover> */}
    </div>
  );
};

export default HomePage;
