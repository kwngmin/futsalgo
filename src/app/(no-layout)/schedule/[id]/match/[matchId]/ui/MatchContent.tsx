"use client";

import { MatchDataResult } from "@/entities/match/model/types";
import { ArrowLeftRight, X } from "lucide-react";
// import Image from "next/image";
import { useRouter } from "next/navigation";
import TeamSide from "./TeamSide";

const MatchContent = ({ data }: { data: MatchDataResult }) => {
  const router = useRouter();
  console.log(data, "data");

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1 className="text-2xl font-bold">{data?.matchOrder} 경기</h1>
          <h1 className="text-2xl font-bold opacity-30">수정</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            onClick={() =>
              router.push(`/schedule/${data?.match.scheduleId}?tab=overview`)
            }
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
      {/* <div className="flex items-center justify-between px-4 h-10 bg-slate-200">
        <div className="text-sm font-medium text-gray-500">사이드</div>
        <div className="text-sm font-medium text-gray-500">바꾸기</div>
      </div> */}
      <div className="flex justify-between py-4 px-2 bg-gradient-to-b from-slate-100 to-white border-b border-slate-200">
        <TeamSide
          side="home"
          logoUrl={data?.match.homeTeam.logoUrl}
          name={data?.match.homeTeam.name}
        />
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="flex justify-center items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer px-2 h-7 w-full">
            <ArrowLeftRight className="size-4 text-gray-600" />
            <span className="font-medium">변경</span>
          </div>
          <div className="flex items-center gap-2 text-3xl font-semibold tracking-tighter">
            <span>{data?.match.homeScore}</span>
            <span>-</span>
            <span>{data?.match.awayScore}</span>
          </div>
        </div>
        <TeamSide
          side="away"
          logoUrl={data?.match.awayTeam.logoUrl}
          name={data?.match.awayTeam.name}
        />
      </div>
      <div className="px-4">
        <div></div>
        {/* 전체 참석처리, 팀원 업데이트 */}
        {/* <div className="grid grid-cols-2 gap-2 sm:max-w-2/3">
          <div className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors">
            <div className="flex items-center gap-2">
              <SquareCheckBig className="size-5 text-gray-400" />
              <span className="text-base font-medium text-center">
                전체 참석처리
              </span>
            </div>

            <div className="flex items-center gap-1"></div>
          </div>
          <div
            className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors"
            onClick={() => {
              addAttendances({ scheduleId, teamId, teamType });
            }}
          >
            <div className="flex items-center gap-2">
              <RefreshCcw className="size-5 text-gray-400" />
              <span className="text-base font-medium">팀원 업데이트</span>
            </div>

            <div className="flex items-center gap-1"></div>
          </div>
        </div> */}
        {/* 참석자 목록 */}
        {/* <div className="mt-4">
          {data.map((attendance, index) => (
            <div
              key={attendance.id}
              className="flex items-center gap-4 py-3 border-t border-gray-100"
            >
              <div className="flex items-center justify-center size-6 text-sm font-medium text-muted-foreground">
                {index + 1}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 grow">
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">
                    {attendance.user.nickname}
                  </span>
                  <span className="font-medium text-muted-foreground">
                    {attendance.user.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:min-w-72">
                  <div className="grow grid grid-cols-3 p-0.5 rounded-md bg-gray-100">
                    <div
                      className={`text-sm rounded-md flex items-center justify-center h-9 transition-colors cursor-pointer ${
                        attendance.attendanceStatus === "ATTENDING"
                          ? "bg-white border shadow-xs font-semibold"
                          : "text-muted-foreground font-medium"
                      }`}
                      onClick={() =>
                        handleUpdate({
                          attendanceId: attendance.id,
                          attendanceStatus: "ATTENDING",
                        })
                      }
                    >
                      참석
                    </div>
                    <div
                      className={`text-sm rounded-md flex items-center justify-center h-9 transition-colors cursor-pointer ${
                        attendance.attendanceStatus === "NOT_ATTENDING"
                          ? "bg-white border shadow-xs font-semibold"
                          : "text-muted-foreground font-medium"
                      }`}
                      onClick={() =>
                        handleUpdate({
                          attendanceId: attendance.id,
                          attendanceStatus: "NOT_ATTENDING",
                        })
                      }
                    >
                      불참
                    </div>
                    <div
                      className={`text-sm rounded-md flex items-center justify-center h-9 transition-colors cursor-pointer ${
                        attendance.attendanceStatus === "UNDECIDED"
                          ? "bg-white border shadow-xs font-semibold"
                          : "text-muted-foreground font-medium"
                      }`}
                      onClick={() =>
                        handleUpdate({
                          attendanceId: attendance.id,
                          attendanceStatus: "UNDECIDED",
                        })
                      }
                    >
                      미정
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-10 rounded-md bg-gray-50 hover:bg-red-500/10 transition-colors cursor-pointer group">
                    <Trash className="size-4 text-gray-600 group-hover:text-destructive transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default MatchContent;
