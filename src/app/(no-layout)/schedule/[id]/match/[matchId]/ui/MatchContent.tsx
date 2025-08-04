"use client";

import { MatchDataResult } from "@/entities/match/model/types";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Dices,
  RefreshCcw,
  Trash,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import TeamSide from "./TeamSide";
import Lineup from "./Lineup";
// import { Button } from "@/shared/components/ui/button";
import { shuffleLineupsAdvanced } from "../actions/shuffle-lineups";
import { useState } from "react";
import GoalRecord from "./GoalRecord";
import { SneakerMoveIcon, SoccerBallIcon } from "@phosphor-icons/react";

const MatchContent = ({ data }: { data: MatchDataResult }) => {
  const router = useRouter();
  console.log(data, "data");

  const [mode, setMode] = useState<"view" | "edit">("view");

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
    data.lineups?.filter((lineup) => lineup.side === "HOME") ?? [];

  const awayLineup =
    data.lineups?.filter((lineup) => lineup.side === "AWAY") ?? [];

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
      {data.goals.map((goal) =>
        goal.scorerSide === "HOME" ? (
          <div className="flex justify-between items-center py-2" key={goal.id}>
            <div className="w-full flex flex-col">
              <div className="flex justify-end items-center gap-1">
                <span className="text-sm font-medium">
                  {goal.isScoredByMercenary ? "용병" : goal.scorer?.nickname}
                </span>
                <span className="text-sm text-muted-foreground">
                  {goal.isOwnGoal ? "(자책골)" : ""}
                </span>
                <SoccerBallIcon className="size-4" weight="fill" />
              </div>
              {(goal.isAssistedByMercenary || goal.assistId) && (
                <div className="flex justify-end items-center gap-2">
                  {/* <span>{goal.assist?.nickname}</span> */}
                  <span className="text-sm">
                    {goal.isAssistedByMercenary
                      ? "용병"
                      : goal.assist?.nickname}
                  </span>
                  <SneakerMoveIcon className="size-4" weight="fill" />
                </div>
              )}
            </div>
            <div className="flex justify-center w-16 shrink-0">0-0</div>
            <div className="w-full" />
          </div>
        ) : (
          <div className="flex justify-between items-center py-1" key={goal.id}>
            <div className="w-full" />
            <div className="flex justify-center w-16 shrink-0">0-0</div>
            <div className="w-full flex flex-col">
              <div className="flex justify-start items-center gap-1">
                <span className="text-sm font-medium">
                  {goal.isScoredByMercenary ? "용병" : goal.scorer?.nickname}
                </span>
                <span className="text-sm text-muted-foreground">
                  {goal.isOwnGoal ? "(자책골)" : ""}
                </span>
                <SoccerBallIcon className="size-4" weight="fill" />
              </div>
              {(goal.isAssistedByMercenary || goal.assistId) && (
                <div className="flex justify-start items-center gap-2">
                  {/* <span>{goal.assist?.nickname}</span> */}
                  <span className="text-sm">
                    {goal.isAssistedByMercenary
                      ? "용병"
                      : goal.assist?.nickname}
                  </span>
                  <SneakerMoveIcon className="size-4" weight="fill" />
                </div>
              )}
            </div>
          </div>
        )
      )}
      {data.permissions.isEditable && (
        <GoalRecord matchId={data.match.id} lineups={data.lineups} />
        // <div className="p-4">
        //   <Button
        //     type="button"
        //     className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
        //     size="lg"
        //   >
        //     GOAL !
        //   </Button>
        // </div>
      )}
      <div className="px-4">
        <div className="w-full flex items-center justify-between h-14 sm:h-11 gap-3 border-t border-gray-100 px-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 text-gray-600" />
            <span className="text-base font-medium">출전 명단</span>
          </div>
          {data.permissions.isEditable && (
            <button
              type="button"
              className="font-semibold text-sm px-4 rounded-full h-8 flex items-center justify-center bg-gray-100 text-gray-500 select-none cursor-pointer hover:bg-gray-200 hover:text-gray-700 transition-all"
              onClick={() => setMode(mode === "view" ? "edit" : "view")}
            >
              {mode === "view" ? "수정" : "완료"}
            </button>
          )}
        </div>
        {mode === "view" ? (
          <div className="grid grid-cols-2 border-y border-gray-100">
            <Lineup lineups={homeLineup} side="home" />
            <Lineup lineups={awayLineup} side="away" />
          </div>
        ) : (
          <div>
            {data.lineups?.map((lineup, index) => (
              <div
                key={lineup.id}
                className="flex items-center gap-4 py-3 border-y border-gray-100"
              >
                <div className="flex items-center justify-center size-6 text-sm font-medium text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 grow">
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold">
                      {lineup.user.nickname}
                    </span>
                    {/* 권한이 있는 경우에만 실명 표시 */}
                    {data.permissions.isMember && "name" in lineup.user && (
                      <span className="font-medium text-muted-foreground">
                        {lineup.user.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 sm:min-w-72">
                    <div className="grow grid grid-cols-2 p-0.5 rounded-md bg-gray-100">
                      <div
                        className={`text-sm rounded-md flex items-center justify-center h-9 transition-colors cursor-pointer tracking-tight ${
                          lineup.side === "HOME"
                            ? "bg-white border shadow-xs font-semibold text-indigo-700"
                            : "text-muted-foreground font-medium hover:text-gray-700"
                        }`}
                      >
                        HOME
                      </div>
                      <div
                        className={`text-sm rounded-md flex items-center tracking-tight justify-center h-9 transition-colors cursor-pointer ${
                          lineup.side === "AWAY"
                            ? "bg-white border shadow-xs font-semibold text-emerald-700"
                            : "text-muted-foreground font-medium hover:text-gray-700"
                        }`}
                      >
                        AWAY
                      </div>
                      {/* <div
                        className={`text-sm rounded-md flex items-center justify-center h-9 transition-colors cursor-pointer ${
                          lineup.side === "UNDECIDED"
                            ? "bg-white border shadow-xs text-gray-600 font-semibold"
                            : "text-muted-foreground font-medium"
                        }`}
                      >
                        휴식
                      </div> */}
                    </div>
                    <div className="flex items-center justify-center w-12 h-10 rounded-md bg-gray-50 hover:bg-red-500/10 transition-colors cursor-pointer group">
                      <Trash className="size-4 text-gray-600 group-hover:text-destructive transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.permissions.isEditable && (
          <div>
            {/* 전체 참석처리, 팀원 업데이트 */}
            {data.match.schedule.matchType === "SQUAD" ? (
              <div className="grid grid-cols-2 gap-2 pt-4">
                <div
                  className="rounded-md px-3 w-full flex items-center h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors"
                  onClick={async () => {
                    // const result = await shuffleLineups(data.match.id);
                    const result = await shuffleLineupsAdvanced(data.match.id);
                    if (result.success) {
                      alert("랜덤 팀 나누기 완료");
                    } else {
                      console.log(result.error, "result.error");
                    }
                  }}
                >
                  <Dices className="size-5 text-gray-400" />
                  <span className="text-base font-medium">랜덤 팀 나누기</span>
                </div>
                <div className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors">
                  <div className="flex items-center gap-2">
                    <RefreshCcw className="size-5 text-gray-400" />
                    <span className="text-base font-medium">명단 업데이트</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:max-w-2/3">
                <div className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="size-5 text-gray-400" />
                    <span className="text-base font-medium text-center">
                      사이드 변경
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

            {/* 삭제 버튼 */}
            <button
              type="button"
              className="my-4 rounded-md px-3 w-full flex items-center justify-center h-12 sm:h-11 gap-3 cursor-pointer bg-destructive/5 hover:bg-destructive/10 transition-colors text-destructive font-medium"
            >
              경기 삭제
            </button>
          </div>
        )}

        {/* 만든 날 */}
        <p className="text-center text-sm text-gray-500 mt-6">
          만든 날:{" "}
          {data.match.createdAt
            ? new Date(data.match.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </p>
      </div>
    </div>
  );
};

export default MatchContent;
