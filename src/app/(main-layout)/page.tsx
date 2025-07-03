"use client";

import { getSchedules } from "@/app/(main-layout)/home/actions/get-schedules";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import formatTimeRange from "@/entities/schedule/lib/format-time-range";

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
        <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
          {/* <Search className="w-5 h-5" /> */}
        </button>
      </div>
      {/* MatchesPage */}
      <div className="px-3 space-y-3">
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
                일정 추가
              </button>
            </div>
          </div>
        )}
        {data?.data?.hostSchedules.map((schedule) => {
          // const start = new Date(schedule.startTime);
          // const end = new Date(schedule.endTime);

          // // 시간 포맷 옵션
          // const timeOptions: Intl.DateTimeFormatOptions = {
          //   hour: "2-digit",
          //   minute: "2-digit",
          // };

          // // full 문자열 추출 (예: 오전 06:00)
          // const startStr = start.toLocaleTimeString("ko-KR", timeOptions);
          // const endStr = end.toLocaleTimeString("ko-KR", timeOptions);

          // // 오전/오후 구분
          // const isSamePeriod =
          //   (startStr.includes("오전") && endStr.includes("오전")) ||
          //   (startStr.includes("오후") && endStr.includes("오후"));

          // // 오전/오후만 추출 (ex: '오전')
          // const startPeriod = startStr.slice(0, 2);
          // const startTime = startStr.slice(3);
          // const endTime = endStr.slice(3);

          // // 최종 포맷
          // const timeRange = isSamePeriod
          //   ? `${startPeriod} ${startTime} ~ ${endTime}`
          //   : `${startStr} ~ ${endStr}`;

          const timeRange = formatTimeRange({
            time: {
              start: schedule.startTime,
              end: schedule.endTime,
            },
          });

          return (
            <div
              className="overflow-hidden bg-white rounded-2xl"
              key={schedule.id}
            >
              <div
                className="cursor-pointer"
                onClick={() => router.push(`/schedule/${schedule.id}`)}
              >
                <div className="flex justify-center *:tracking-tight items-center h-4 gap-1 mt-4 mb-1 text-sm">
                  <span>
                    {schedule.date.toLocaleDateString("ko-KR", {
                      // year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {/* {`${schedule.startTime.toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} ~ ${schedule.endTime.toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`} */}
                  <span className="">{timeRange}</span>
                </div>

                {schedule.matchType !== "TEAM" ? (
                  <div className="flex justify-center items-center gap-2 h-14">
                    <div className="flex flex-col items-end gap-2">
                      {/* <div>HOME</div> */}
                      <div className="flex items-center gap-1">
                        <div className="sm:text-lg font-bold">
                          {schedule.hostTeam.name}
                        </div>
                        {schedule.hostTeam.logoUrl ? (
                          <div className="size-8 sm:size-12">
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
                    <div className="font-bold">VS</div>
                    <div className="flex flex-col gap-2">
                      {/* <div>AWAY</div> */}
                      <div className="flex items-center gap-1">
                        {/* <div>AWAY</div> */}
                        {schedule.hostTeam.logoUrl ? (
                          <div className="size-8 sm:size-12">
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
                        <div className="text-lg font-bold">
                          {schedule.hostTeam.name}
                        </div>
                        {/* <div>HOME</div> */}
                      </div>
                    </div>
                  </div>
                ) : (
                  schedule.guestTeam?.name
                )}
                <div className="w-full flex justify-center">
                  <div className="flex items-center mb-4 rounded-full !font-medium text-sm text-muted-foreground px-3 h-6">
                    {`${schedule.place}`}
                  </div>
                </div>
              </div>

              {schedule.attendances
                .map((attendance) => attendance.userId)
                .includes(session.data?.user?.id ?? "") ? (
                <div>hello</div>
              ) : (
                <div className="w-full grid grid-cols-2 border-t border-input h-12 *:cursor-pointer *:font-medium">
                  <button className="!font-semibold text-blue-600">참석</button>
                  <button className="text-destructive border-l border-input">
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
