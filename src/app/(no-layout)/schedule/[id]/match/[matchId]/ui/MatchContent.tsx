"use client";

import { Info, Minus, Power, RotateCw, Shuffle, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import TeamSide from "./TeamSide";
import Lineup from "./Lineup";
import { shuffleLineupsAdvanced } from "../actions/shuffle-lineups";
import { useState, useMemo, useCallback } from "react";
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
  updateMercenaryCount,
  resetLineups, // 새로운 액션 함수
} from "../actions/match-actions";
import {
  // ClockCounterClockwiseIcon,
  SneakerMoveIcon,
  SoccerBallIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import CustomSelect from "@/shared/components/ui/custom-select";
import { Separator } from "@/shared/components/ui/separator";
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

  // 용병 수 상태 관리
  const [homeMercenaryCount, setHomeMercenaryCount] = useState(
    data?.match.homeTeamMercenaryCount ?? 0
  );
  const [awayMercenaryCount, setAwayMercenaryCount] = useState(
    data?.match.awayTeamMercenaryCount ?? 0
  );

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

  // 용병 수 계산 로직
  const mercenaryCalculation = useMemo(() => {
    if (!data) return { homeMax: 0, awayMax: 0, undecidedCount: 0 };

    if (data.match.schedule.matchType === "TEAM") {
      return {
        homeMax: data.match.schedule.hostTeamMercenaryCount,
        awayMax: data.match.schedule.invitedTeamMercenaryCount || 0,
        undecidedCount: 0,
      };
    }

    const totalMercenaryCount =
      data.match.homeTeamMercenaryCount +
      data.match.awayTeamMercenaryCount +
      data.match.undecidedTeamMercenaryCount;

    // HOME 최대 선택 가능 수: undecided + 현재 home count
    const homeMax = data.match.undecidedTeamMercenaryCount + homeMercenaryCount;

    // AWAY 최대 선택 가능 수: undecided + 현재 away count
    const awayMax = data.match.undecidedTeamMercenaryCount + awayMercenaryCount;

    // 현재 undecided 수: 전체 - 현재 배정된 수
    const undecidedCount =
      totalMercenaryCount - homeMercenaryCount - awayMercenaryCount;

    return { homeMax, awayMax, undecidedCount };
  }, [data, homeMercenaryCount, awayMercenaryCount]);

  // 라인업 필터링 (useMemo로 최적화)
  const { homeLineup, awayLineup } = useMemo(() => {
    if (!data) return { homeLineup: [], awayLineup: [] };

    return {
      homeLineup: data.lineups.filter((lineup) => lineup.side === "HOME"),
      awayLineup: data.lineups.filter((lineup) => lineup.side === "AWAY"),
    };
  }, [data]);

  // 네비게이션 관련 계산 (useMemo로 최적화)
  const navigationInfo = useMemo(() => {
    if (!data)
      return { currentIndex: -1, isPrevDisabled: true, isNextDisabled: true };

    const currentIndex = data.allMatches.findIndex(
      (match) => match.id === data.match.id
    );

    return {
      currentIndex,
      isPrevDisabled: currentIndex === 0,
      isNextDisabled: currentIndex === data.allMatches.length - 1,
    };
  }, [data]);

  // 공통 쿼리 무효화 함수
  const invalidateMatchQueries = useCallback(() => {
    if (!data) return;
    queryClient.invalidateQueries({
      queryKey: ["matchData", data.match.id, data.match.scheduleId],
    });
  }, [queryClient, data]);

  // 공통 에러 처리 함수
  const handleAsyncOperation = useCallback(
    async (
      operation: () => Promise<{
        success: boolean;
        error?: string;
        data?: { homeMercenaryCount?: number; awayMercenaryCount?: number };
      }>,
      successMessage?: string
    ) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const result = await operation();
        if (result?.success) {
          if (successMessage) alert(successMessage);
          invalidateMatchQueries();
          return result;
        } else {
          console.error(result?.error);
          alert(result?.error || "작업에 실패했습니다.");
          return false;
        }
      } catch (error) {
        console.error("작업 오류:", error);
        alert("오류가 발생했습니다.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, invalidateMatchQueries]
  );

  // 네비게이션 핸들러
  const handleNavigation = useCallback(
    (direction: "prev" | "next") => {
      if (!data || navigationInfo.currentIndex === -1) return;

      const targetIndex =
        direction === "prev"
          ? navigationInfo.currentIndex - 1
          : navigationInfo.currentIndex + 1;
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
    },
    [data, navigationInfo.currentIndex, router, searchParams]
  );

  // 타입 가드
  if (!data) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  // 랜덤 팀 나누기 핸들러 (개선됨)
  const handleShuffleLineups = async () => {
    // 이미 팀이 나뉘어져 있는지 확인
    const hasExistingTeams = homeLineup.length > 0 || awayLineup.length > 0;

    if (hasExistingTeams) {
      const confirmed = confirm(
        "이미 팀이 구성되어 있습니다. 다시 랜덤으로 팀을 나누시겠습니까?"
      );
      if (!confirmed) return;
    }

    const result = await handleAsyncOperation(
      () => shuffleLineupsAdvanced(data.match.id),
      "랜덤 팀 나누기 완료"
    );
    if (result && typeof result === "object" && "data" in result) {
      setHomeMercenaryCount(result.data?.homeMercenaryCount ?? 0);
      setAwayMercenaryCount(result.data?.awayMercenaryCount ?? 0);
    }
  };

  // 명단 업데이트 핸들러
  const handleUpdateLineup = async () => {
    const operation =
      data.match.schedule.matchType === "SQUAD"
        ? () => updateSquadLineup(data.match.id)
        : () => updateTeamMatchLineup(data.match.id);

    await handleAsyncOperation(
      operation,
      "출전 명단 업데이트가 완료되었습니다"
    );
  };

  // 용병 수 업데이트 핸들러
  const handleMercenaryUpdate = async (
    side: "home" | "away",
    count: number
  ) => {
    const newHomeCount = side === "home" ? count : homeMercenaryCount;
    const newAwayCount = side === "away" ? count : awayMercenaryCount;

    const success = await handleAsyncOperation(() =>
      updateMercenaryCount(data.match.id, newHomeCount, newAwayCount)
    );

    if (success) {
      // 로컬 상태 업데이트
      if (side === "home") {
        setHomeMercenaryCount(count);
      } else {
        setAwayMercenaryCount(count);
      }
    }
  };

  // 초기화 핸들러 (새로 구현됨)
  const handleResetLineups = async () => {
    const confirmed = confirm(
      "출전 명단을 초기화하시겠습니까? 모든 팀 배정이 취소됩니다."
    );
    if (!confirmed) return;

    const success = await handleAsyncOperation(
      () => resetLineups(data.match.id),
      "출전 명단이 초기화되었습니다"
    );

    if (success) {
      // 로컬 상태 초기화
      setHomeMercenaryCount(0);
      setAwayMercenaryCount(0);
    }
  };

  // 경기 삭제 핸들러
  const handleDeleteMatch = async () => {
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

  // 골 삭제 핸들러
  const handleDeleteGoal = async (goalId: string) => {
    await handleAsyncOperation(async () => {
      await deleteGoalRecord(goalId);
      return { success: true };
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 네비게이션 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-2 items-center">
          <h1 className="text-[1.625rem] font-bold min-w-16">
            {data.matchOrder}경기
          </h1>
          <NavigationButton
            direction="prev"
            disabled={navigationInfo.isPrevDisabled}
            onClick={() => handleNavigation("prev")}
          />
          <NavigationButton
            direction="next"
            disabled={navigationInfo.isNextDisabled}
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
        <div className="relative grid grid-cols-2 p-4 sm:pb-6 gap-8 bg-gradient-to-b from-slate-100 to-white sm:to-slate-50 sm:mx-4 sm:rounded-md">
          <TeamSide
            logoUrl={data.match.homeTeam.logoUrl}
            name={data.match.homeTeam.name}
            teamId={data.match.homeTeam.id}
            label={
              data.match.schedule.matchType === "SQUAD" ? "HOME" : "주최팀"
            }
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
            teamId={data.match.awayTeam.id}
            label={
              data.match.schedule.matchType === "SQUAD" ? "AWAY" : "초청팀"
            }
          />
        </div>

        {/* 골 기록 */}
        {goalsWithScore.length > 0 && (
          <div className="px-4">
            {/* {data.permissions.isEditable && (
              <div className="flex justify-between items-center py-2 min-h-13 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <ClockCounterClockwiseIcon
                    className="size-7 text-stone-500"
                    weight="fill"
                  />
                  <h2 className="text-lg font-semibold">득점기록</h2>
                </div>
                <button
                  type="button"
                  className={`font-semibold text-sm px-4 rounded-full h-8 flex items-center justify-center select-none cursor-pointer transition-all border ${
                    mode !== "view"
                      ? "bg-gray-800 text-white hover:bg-gray-600 border-transparent"
                      : "text-gray-700 hover:text-gray-800 hover:bg-gray-200 bg-gray-100 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  수정
                </button>
              </div>
            )} */}
            {goalsWithScore.map((goal, index) => (
              <div
                key={goal.id}
                className="px-2 flex items-center border-t first:border-t-0 border-gray-100 relative hover:bg-gray-50 transition-colors select-none"
              >
                {/* 순서 */}
                <div className="text-sm size-9 sm:size-8 flex items-center text-zinc-500/50 shrink-0 absolute left-0 sm:left-4">
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
                    className="absolute right-0 sm:right-4 text-sm font-medium size-9 sm:size-8 flex justify-center items-center cursor-pointer bg-destructive/5 rounded-md sm:hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur z-10"
                    disabled={isLoading}
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    <Minus className="size-4.5 sm:size-4 text-destructive" />
                  </button>
                )}
              </div>
            ))}

            <div className="flex items-center justify-center px-2 h-16 select-none mt-2">
              <div className="text-sm text-gray-500 h-5 flex items-center border-l-2 border-gray-200" />
              <div className="grow border-t border-gray-200" />
              <div className="flex items-center px-2 gap-1.5">
                <div className="flex items-center gap-1 rounded-full pl-2 pr-2.5 h-7">
                  <SoccerBallIcon
                    className="size-3.5 text-gray-600"
                    weight="fill"
                  />
                  <span className="text-xs font-medium text-gray-800">골</span>
                </div>
                <div className="flex items-center gap-1 rounded-full pl-2 pr-2.5 h-7">
                  <SneakerMoveIcon
                    className="size-3.5 text-gray-600"
                    weight="fill"
                  />
                  <span className="text-xs font-medium text-gray-800">
                    어시스트
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded-full pl-2 pr-2.5 h-7">
                  <SoccerBallIcon
                    className="size-3.5 text-destructive/80"
                    weight="fill"
                  />
                  <span className="text-xs font-medium text-destructive">
                    자책골
                  </span>
                </div>
              </div>
              <div className="grow border-t border-gray-200" />
              <div className="text-sm text-gray-500 h-5 flex items-center border-l-2 border-gray-200" />
            </div>
          </div>
        )}

        {/* 골 기록 입력 */}
        {data.permissions.isEditable &&
          new Date(
            `${data.match.schedule.date} ${data.match.schedule.startTime}`
          ) <= new Date() && (
            <GoalRecord
              matchId={data.match.id}
              lineups={data.lineups}
              scheduleId={data.match.scheduleId}
              homeMercenaryCount={homeMercenaryCount}
              awayMercenaryCount={awayMercenaryCount}
              matchType={data.match.schedule.matchType}
            />
          )}

        {/* 출전 명단 */}
        <div className="px-4">
          <div className="flex justify-between items-center py-2 min-h-13">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-7 text-stone-500" />
              <h2 className="text-lg font-semibold">출전 명단</h2>
              <span className="font-medium text-amber-600">
                {homeMercenaryCount +
                  awayMercenaryCount +
                  data.lineups.filter((lineup) => lineup.side !== "UNDECIDED")
                    .length}
              </span>
            </div>
            {data.permissions.isEditable && goalsWithScore.length === 0 && (
              <button
                type="button"
                className={`font-semibold text-sm px-4 rounded-full h-8 flex items-center justify-center select-none cursor-pointer transition-all border ${
                  mode !== "view"
                    ? "bg-gray-800 text-white hover:bg-gray-600 border-transparent"
                    : "text-gray-700 hover:text-gray-800 hover:bg-gray-200 bg-gray-100 border-gray-300 hover:border-gray-400"
                }`}
                onClick={() =>
                  mode !== "view" ? setMode("view") : setMode("edit")
                }
              >
                {mode !== "view" ? "완료" : "수정"}
              </button>
            )}
          </div>

          {mode === "view" ? (
            <div className="grid grid-cols-2 gap-2">
              <Lineup
                lineups={homeLineup}
                MercenaryCount={homeMercenaryCount}
              />
              <Lineup
                lineups={awayLineup}
                MercenaryCount={awayMercenaryCount}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {data.match.schedule.matchType === "SQUAD" ? (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    className="rounded-md px-2 w-full flex items-center h-11 sm:h-10 gap-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleUpdateLineup}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-white">
                        <RotateCw className="size-5 sm:size-4 text-gray-500" />
                      </div>
                      <span className="sm:text-sm font-medium">새로고침</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="rounded-md px-2 w-full flex items-center h-11 sm:h-10 gap-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleShuffleLineups}
                  >
                    <div className="p-1.5 rounded-full bg-white">
                      <Shuffle className="size-5 sm:size-4 text-gray-500" />
                    </div>
                    <span className="sm:text-sm font-medium">랜덤 팀</span>
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="rounded-md px-2 w-full flex items-center h-11 sm:h-10 gap-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleResetLineups}
                  >
                    <div className="p-1.5 rounded-full bg-white">
                      <Power className="size-5 sm:size-4 text-gray-500" />
                    </div>
                    <span className="sm:text-sm font-medium">초기화</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    className="rounded-md px-2 w-full flex items-center h-11 sm:h-10 gap-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleUpdateLineup}
                  >
                    <div className="p-1.5 rounded-full bg-white">
                      <RotateCw className="size-5 sm:size-4 text-gray-500" />
                    </div>
                    <span className="sm:text-sm font-medium">새로고침</span>
                  </button>
                </div>
              )}
              {data.match.schedule.matchType === "SQUAD" ? (
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
              {((data.match.schedule.matchType === "SQUAD" &&
                data.match.schedule.hostTeamMercenaryCount !== 0) ||
                (data.match.schedule.matchType === "TEAM" &&
                  (data.match.schedule.hostTeamMercenaryCount !== 0 ||
                    data.match.schedule.invitedTeamMercenaryCount !== 0))) && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex items-center h-12 sm:h-11 shrink-0 px-3.5 sm:px-4 *:leading-tight gap-2 min-w-32">
                      <span className="font-medium text-gray-800">용병</span>
                      <Separator orientation="vertical" className="!h-5" />
                      <span className="text-sm text-gray-500">HOME</span>
                    </div>
                    <CustomSelect
                      size="sm"
                      className="w-full"
                      value={homeMercenaryCount.toString()}
                      disabled={
                        isLoading || mercenaryCalculation.homeMax + 1 === 1
                      }
                      onChange={async (e) => {
                        const newCount = parseInt(e.target.value);
                        await handleMercenaryUpdate("home", newCount);
                      }}
                      options={Array.from(
                        { length: mercenaryCalculation.homeMax + 1 },
                        (_, index) => (
                          <option key={index} value={index}>
                            {index}명
                          </option>
                        )
                      )}
                    />
                  </div>
                  <div className="hidden sm:block w-px border-l border-gray-200 h-8" />
                  <div className="sm:hidden w-full border-b border-gray-200" />
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex items-center h-12 sm:h-11 shrink-0 px-3.5 sm:px-4 *:leading-tight gap-2 min-w-32">
                      <span className="font-medium text-gray-800">용병</span>
                      <Separator orientation="vertical" className="!h-5" />
                      <span className="text-sm text-gray-500">AWAY</span>
                    </div>
                    <CustomSelect
                      size="sm"
                      className="w-full"
                      value={awayMercenaryCount.toString()}
                      disabled={
                        isLoading || mercenaryCalculation.awayMax + 1 === 1
                      }
                      onChange={async (e) => {
                        const newCount = parseInt(e.target.value);
                        await handleMercenaryUpdate("away", newCount);
                      }}
                      options={Array.from(
                        { length: mercenaryCalculation.awayMax + 1 },
                        (_, index) => (
                          <option key={index} value={index}>
                            {index}명
                          </option>
                        )
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {goalsWithScore.length > 0 && data.permissions.isEditable && (
            <div className="h-9 mb-2 flex items-center gap-2 px-3 mt-2 bg-amber-500/5 rounded-sm">
              <Info className="size-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                명단 수정은 득점기록이 존재하지 않아야 가능합니다
              </span>
            </div>
          )}

          {/* 관리 버튼들 */}
          {data.permissions.isEditable && (
            <button
              type="button"
              disabled={isLoading}
              className="my-4 rounded-md px-3 w-full flex items-center justify-center h-12 sm:h-11 gap-3 cursor-pointer bg-destructive/5 hover:bg-destructive/10 transition-colors text-destructive font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDeleteMatch}
            >
              경기 삭제
            </button>
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
