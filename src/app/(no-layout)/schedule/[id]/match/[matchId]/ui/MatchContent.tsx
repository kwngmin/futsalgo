"use client";

import { MatchDataResult } from "@/entities/match/model/types";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Dices,
  RefreshCcw,
  UserRoundPen,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import TeamSide from "./TeamSide";
import Lineup from "./Lineup";
import { Button } from "@/shared/components/ui/button";

const MatchContent = ({ data }: { data: MatchDataResult }) => {
  const router = useRouter();
  console.log(data, "data");

  const currentIndex = data?.allMatches.findIndex(
    (match) => match.id === data.match.id
  );
  console.log(currentIndex, "currentIndex");

  // 해결책 1: 타입 가드 함수 사용
  if (!data) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  // 해결책 2: 기본값 제공 + 명시적 타입 지정
  const homeLineup =
    data.match.lineups?.filter((lineup) => lineup.side === "HOME") ?? [];

  const awayLineup =
    data.match.lineups?.filter((lineup) => lineup.side === "AWAY") ?? [];

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1 className="text-2xl font-bold">{data?.matchOrder}경기</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`shrink-0 px-3 h-10 flex items-center gap-1.5 font-medium justify-center text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors  ${
              currentIndex === 0
                ? "opacity-50 cursor-default pointer-events-none"
                : "cursor-pointer"
            }`}
            onClick={() => {
              if (currentIndex === 0 || currentIndex === undefined) return;
              router.push(
                `/schedule/${data?.match.scheduleId}/match/${
                  data.allMatches[currentIndex - 1]?.id
                }`
              );
            }}
          >
            <ChevronUp className="size-5" strokeWidth={2.5} />
            이전
          </button>
          <button
            className={`shrink-0 px-3 h-10 flex items-center gap-1.5 font-medium justify-center text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors  ${
              currentIndex === data?.allMatches.length - 1
                ? "opacity-50 cursor-default pointer-events-none"
                : "cursor-pointer"
            }`}
            onClick={() => {
              if (
                currentIndex === data?.allMatches.length - 1 ||
                currentIndex === undefined
              )
                return;
              router.push(
                `/schedule/${data?.match.scheduleId}/match/${
                  data.allMatches[currentIndex + 1]?.id
                }`
              );
            }}
          >
            <ChevronDown className="size-5" strokeWidth={2.5} />
            다음
          </button>
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
      <div className="relative grid grid-cols-2 p-4 gap-8 bg-gradient-to-b from-slate-100 to-white sm:mx-4 sm:rounded-md">
        <TeamSide
          side="home"
          logoUrl={data?.match.homeTeam.logoUrl}
          name={data?.match.homeTeam.name}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 shrink-0 w-20 pt-4">
          {/* <button
            className="flex justify-center items-center gap-1 text-sm font-medium text-slate-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer px-3 h-8 bg-slate-50 border border-slate-400 disabled:opacity-30 disabled:cursor-default"
            type="button"
            onClick={() => {
              console.log("변경");
            }}
            disabled={data.match.awayTeamId === data.match.homeTeamId}
          >
            <ArrowLeftRight className="size-4 text-slate-600" />
            <span className="font-medium">변경</span>
          </button> */}
          <div className="flex items-center gap-2 text-3xl font-semibold tracking-tighter my-auto">
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
      <div className="p-4">
        <Button
          type="button"
          className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
          size="lg"
          // onClick={async () => {
          //   const result = await addMatch(scheduleId);
          //   if (result.success) {
          //     refetch();
          //   } else {
          //     console.log(result.error, "result.error");
          //   }
          // }}
        >
          GOAL !
        </Button>
      </div>
      <div className="px-4">
        {/* 전체 참석처리, 팀원 업데이트 */}
        {data.match.schedule.matchType === "SQUAD" ? (
          <div className="grid grid-cols-2 gap-2 sm:max-w-2/3">
            <div className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors">
              <div className="flex items-center gap-2">
                <UserRoundPen className="size-5 text-gray-400" />
                <span className="text-base font-medium text-center">
                  팀 배정하기
                </span>
              </div>
            </div>
            <div className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors">
              <div className="flex items-center gap-2">
                <Dices className="size-5 text-gray-400" />
                <span className="text-base font-medium">무작위 팀 배정</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:max-w-2/3">
            <div className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="size-5 text-gray-400" />
                <span className="text-base font-medium text-center">
                  사이드 바꾸기
                </span>
              </div>
            </div>
            <div className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors">
              <div className="flex items-center gap-2">
                <RefreshCcw className="size-5 text-gray-400" />
                <span className="text-base font-medium">명단 업데이트</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Lineup lineups={homeLineup} />
          <Lineup lineups={awayLineup} />
        </div>

        <div>
          {/* {Boolean(data?.data.schedule?.description) && (
            <p className="mx-4 border p-4 bg-white rounded-2xl min-h-40 whitespace-pre-line mb-3 break-words">
              {data?.data.schedule?.description ?? "안내 사항 없음"}
            </p>
          )} */}
        </div>
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
