"use client";

import { Dices, Info, Minus, RefreshCcw, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import TeamSide from "./TeamSide";
import Lineup from "./Lineup";
import { shuffleLineupsAdvanced } from "../actions/shuffle-lineups";
import { useState, useMemo } from "react";
import GoalRecord from "./GoalRecord";
import type { MatchDataResult, GoalWithScore } from "../model/types";
import { NavigationButton } from "./NavigationButton";
import { GoalItem } from "./GoalItem";
import { SquadLineupEditItem } from "./SquadLineupEditItem";
import { deleteGoalRecord } from "../actions/create-goal-record";
import {
  deleteMatch,
  updateSquadLineup,
  updateTeamMatchLineup,
} from "../actions/match-actions";
import {
  ClipboardTextIcon,
  ClockCounterClockwiseIcon,
  SneakerMoveIcon,
  SoccerBallIcon,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { TeamLineupEditItem } from "./TeamLineupEdititem";

interface MatchContentProps {
  data: MatchDataResult | null;
}

const MatchContent = ({ data }: MatchContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [isLoading, setIsLoading] = useState(false);

  // 골 기록을 기반으로 각 시점의 점수 계산 (useMemo로 최적화)
  const goalsWithScore = useMemo((): GoalWithScore[] => {
    if (!data) return [];

    let homeScore = 0;
    let awayScore = 0;

    return data.goals.map((goal) => {
      if (goal.scorerSide === "HOME") {
        if (!goal.isOwnGoal) {
          homeScore++;
        } else {
          awayScore++;
        }
      } else {
        if (!goal.isOwnGoal) {
          awayScore++;
        } else {
          homeScore++;
        }
      }

      return {
        ...goal,
        scoreAtTime: `${homeScore}-${awayScore}`,
      };
    });
  }, [data]);

  // 타입 가드
  if (!data) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  const currentIndex = data.allMatches.findIndex(
    (match) => match.id === data.match.id
  );

  // 라인업 필터링
  const homeLineup = data.lineups.filter((lineup) => lineup.side === "HOME");
  const awayLineup = data.lineups.filter((lineup) => lineup.side === "AWAY");

  // 네비게이션 핸들러
  const handleNavigation = (direction: "prev" | "next") => {
    if (currentIndex === -1) return;

    const targetIndex =
      direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    const targetMatch = data.allMatches[targetIndex];

    if (targetMatch) {
      router.push(
        `/schedule/${data.match.scheduleId}/match/${targetMatch.id}${
          searchParams.get("tab") === "/my-schedules"
            ? `?tab=/my-schedules`
            : ""
        }`
      );
    }
  };

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex === data.allMatches.length - 1;

  // 랜덤 팀 나누기 핸들러
  const handleShuffleLineups = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await shuffleLineupsAdvanced(data.match.id);
      if (result.success) {
        alert("랜덤 팀 나누기 완료");
      } else {
        console.error(result.error);
        alert("랜덤 팀 나누기에 실패했습니다.");
      }
    } catch (error) {
      console.error("Shuffle error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 명단 업데이트 핸들러
  const handleUpdateLineup = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      let result;
      if (data.match.schedule.matchType === "SQUAD") {
        result = await updateSquadLineup(data.match.id);
      } else {
        result = await updateTeamMatchLineup(data.match.id);
      }

      if (result.success) {
        alert(result.message || "명단 업데이트가 완료되었습니다");
      } else {
        console.error(result.error);
        alert(result.error || "명단 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("명단 업데이트 오류:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 경기 삭제 핸들러
  const handleDeleteMatch = async () => {
    if (isLoading) return;

    if (!confirm("경기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteMatch(data.match.id, data.match.scheduleId);
      queryClient.invalidateQueries({
        queryKey: ["schedule", data.match.scheduleId],
      });
      router.push(
        `/schedule/${data.match.scheduleId}${
          searchParams.get("tab") === "/my-schedules"
            ? `?tab=/my-schedules`
            : ""
        }`
      );
    } catch (error) {
      console.error("경기 삭제 오류:", error);
      alert("경기 삭제에 실패했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 네비게이션 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-2 items-center">
          <h1 className="text-2xl font-bold min-w-16">
            {/* <h1 className="text-2xl font-bold min-w-32 flex items-center gap-2"> */}
            {data.matchOrder}경기
            {/* <Separator
              className="!h-4 bg-gray-400 !w-0.25"
              orientation="vertical"
            />
            <span className="text-lg font-medium text-gray-800">
              {data.match.schedule.matchType === "SQUAD" ? "자체전" : "친선전"}
            </span> */}
          </h1>
          <NavigationButton
            direction="prev"
            disabled={isPrevDisabled}
            onClick={() => handleNavigation("prev")}
          />
          <NavigationButton
            direction="next"
            disabled={isNextDisabled}
            onClick={() => handleNavigation("next")}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            onClick={() =>
              router.push(
                `/schedule/${data.match.scheduleId}${
                  searchParams.get("tab") === "/my-schedules"
                    ? `?tab=/my-schedules`
                    : ""
                }`
              )
            }
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* 콘텐트 영역 */}
      <div className="space-y-3">
        {/* 팀 정보 및 점수 */}
        <div className="relative grid grid-cols-2 px-4 pt-6 pb-3 sm:pb-6 gap-8 bg-gradient-to-b from-slate-100 to-white sm:to-slate-50 sm:mx-4 sm:rounded-md">
          <TeamSide
            logoUrl={data.match.homeTeam.logoUrl}
            name={data.match.homeTeam.name}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 shrink-0 w-20 pt-4 pb-3 sm:pb-6">
            <div className="flex items-center gap-2 text-4xl font-bold tracking-tighter my-auto">
              <span>{data.match.homeScore}</span>
              <span>-</span>
              <span>{data.match.awayScore}</span>
            </div>
          </div>
          <TeamSide
            logoUrl={data.match.awayTeam.logoUrl}
            name={data.match.awayTeam.name}
          />
        </div>

        {/* 골 기록 */}
        {goalsWithScore.length > 0 && (
          <div className="px-4">
            <div className="flex justify-between items-center py-2 min-h-13">
              <div className="flex items-center gap-2">
                <ClockCounterClockwiseIcon
                  className="size-7 text-stone-500"
                  weight="fill"
                />
                <h2 className="text-lg font-semibold">득점기록</h2>
              </div>
              <div className="flex items-center gap-1 justify-center">
                <div className="flex items-center gap-1 rounded-full px-2 h-6">
                  <SoccerBallIcon
                    className="size-3 text-gray-700"
                    weight="fill"
                  />
                  <span className="text-xs font-medium">골</span>
                </div>
                <div className="flex items-center gap-1 rounded-full px-2 h-6">
                  <SneakerMoveIcon
                    className="size-3 text-gray-700"
                    weight="fill"
                  />
                  <span className="text-xs font-medium">어시스트</span>
                </div>
                <div className="flex items-center gap-1 rounded-full px-2 h-6">
                  <SoccerBallIcon
                    className="size-3 text-destructive"
                    weight="fill"
                  />
                  <span className="text-xs font-medium text-destructive">
                    자책골
                  </span>
                </div>
              </div>
            </div>
            {goalsWithScore.map((goal, index) => (
              <div
                key={goal.id}
                className="px-2 flex items-center border-t border-gray-100 relative"
              >
                {/* 순서 */}
                <div className="text-sm size-9 sm:size-8 flex items-center text-zinc-500/50 shrink-0 absolute left-0">
                  {index + 1}
                </div>

                {/* 골 기록 */}
                <GoalItem
                  goal={goal}
                  scoreAtTime={goal.scoreAtTime}
                  isHome={goal.scorerSide === "HOME"}
                />

                {/* 삭제 버튼 */}
                {data.permissions.isEditable && (
                  <button
                    type="button"
                    className="absolute right-0 text-sm font-medium size-9 sm:size-8 flex justify-center items-center cursor-pointer bg-destructive/5 rounded-md sm:hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur z-10"
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        await deleteGoalRecord(goal.id);
                      } catch (error) {
                        console.error("골 기록 삭제 실패:", error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    <Minus className="size-4.5 sm:size-4 text-destructive" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 골 기록 입력 */}
        {data.permissions.isEditable &&
          data.match.schedule.startTime <= new Date() && (
            <GoalRecord
              matchId={data.match.id}
              lineups={data.lineups}
              scheduleId={data.match.scheduleId}
            />
          )}

        {/* 팀 명단 */}
        <div className="px-4">
          <div className="flex justify-between items-center py-2 min-h-13">
            <div className="flex items-center gap-2">
              <ClipboardTextIcon
                className="size-7 text-stone-500"
                weight="fill"
              />
              <h2 className="text-lg font-semibold">팀 명단</h2>
            </div>
            {data.permissions.isEditable && (
              <div className="flex items-center gap-3">
                {/* <span className="text-sm text-gray-500">모드</span> */}
                <div className="flex items-center p-0.5 bg-gray-100 rounded-full">
                  <button
                    type="button"
                    className={`font-semibold text-sm px-4 rounded-full h-8 flex items-center justify-center select-none cursor-pointer transition-all ${
                      mode === "view"
                        ? "bg-white shadow-xs"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setMode("view")}
                  >
                    보기
                  </button>
                  <button
                    type="button"
                    className={`font-semibold text-sm px-4 rounded-full h-8 flex items-center justify-center select-none cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                      mode === "edit"
                        ? "bg-white shadow-xs"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setMode("edit")}
                    disabled={goalsWithScore.length > 0}
                  >
                    수정
                  </button>
                </div>
              </div>
            )}
          </div>

          {goalsWithScore.length > 0 && data.permissions.isEditable && (
            <div className="h-8 mb-2 flex items-center gap-2 px-3 bg-amber-50 rounded-md border border-amber-100">
              <Info className="size-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                명단 수정은 득점기록이 존재하지 않아야 가능합니다
              </span>
            </div>
          )}

          {mode === "view" ? (
            <div className="grid grid-cols-2 gap-2">
              <Lineup lineups={homeLineup} />
              <Lineup lineups={awayLineup} />
            </div>
          ) : data.match.schedule.matchType === "SQUAD" ? (
            <div className="border rounded-2xl overflow-hidden">
              {data.lineups.map((lineup, index) => (
                <SquadLineupEditItem
                  key={lineup.id}
                  lineup={lineup}
                  index={index}
                  isMember={data.permissions.isMember}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="border rounded-2xl overflow-hidden">
                {homeLineup.map((lineup, index) => (
                  <TeamLineupEditItem
                    key={lineup.id}
                    lineup={lineup}
                    index={index}
                    isMember={data.permissions.isMember}
                  />
                ))}
              </div>
              <div className="border rounded-2xl overflow-hidden">
                {awayLineup.map((lineup, index) => (
                  <TeamLineupEditItem
                    key={lineup.id}
                    lineup={lineup}
                    index={index}
                    isMember={data.permissions.isMember}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 관리 버튼들 */}
          {goalsWithScore.length === 0 && data.permissions.isEditable && (
            <div>
              {data.match.schedule.matchType === "SQUAD" ? (
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <button
                    type="button"
                    disabled={isLoading}
                    className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleUpdateLineup}
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCcw className="size-5 text-gray-400" />
                      <span className="text-base font-medium">
                        명단 업데이트
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="rounded-md px-3 w-full flex items-center h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleShuffleLineups}
                  >
                    <Dices className="size-5 text-gray-400" />
                    <span className="text-base font-medium">
                      랜덤 팀 나누기
                    </span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <button
                    type="button"
                    disabled={isLoading}
                    className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleUpdateLineup}
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCcw className="size-5 text-gray-400" />
                      <span className="text-base font-medium">
                        명단 업데이트
                      </span>
                    </div>
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={isLoading}
                className="my-4 rounded-md px-3 w-full flex items-center justify-center h-12 sm:h-11 gap-3 cursor-pointer bg-destructive/5 hover:bg-destructive/10 transition-colors text-destructive font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDeleteMatch}
              >
                경기 삭제
              </button>
            </div>
          )}

          {/* 생성일 */}
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
    </div>
  );
};

export default MatchContent;
