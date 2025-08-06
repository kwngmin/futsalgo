"use client";

import {
  ArrowLeftRight,
  ClipboardList,
  Dices,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import TeamSide from "./TeamSide";
import Lineup from "./Lineup";
import { shuffleLineupsAdvanced } from "../actions/shuffle-lineups";
import { useState, useMemo } from "react";
import GoalRecord from "./GoalRecord";
import type { MatchDataResult, GoalWithScore } from "../model/types";
import { NavigationButton } from "./NavigationButton";
import { GoalItem } from "./GoalItem";
import { LineupEditItem } from "./LineupEditItem";
import { deleteGoalRecord } from "../actions/create-goal-record";
// import { SoccerBallIcon } from "@phosphor-icons/react";

interface MatchContentProps {
  data: MatchDataResult | null;
}

const MatchContent = ({ data }: MatchContentProps) => {
  const router = useRouter();
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
      router.push(`/schedule/${data.match.scheduleId}/match/${targetMatch.id}`);
    }
  };

  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex === data.allMatches.length - 1;

  // 랜덤 팀 나누기 핸들러
  const handleShuffleLineups = async () => {
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
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 네비게이션 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1 className="text-2xl font-bold">{data.matchOrder}경기</h1>
        </div>
        <div className="flex items-center gap-2">
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
          <button
            className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            onClick={() =>
              router.push(`/schedule/${data.match.scheduleId}?tab=overview`)
            }
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* 콘텐트 영역 */}
      <div className="space-y-3">
        {/* 팀 정보 및 점수 */}
        <div className="relative grid grid-cols-2 px-4 pt-6 pb-10 gap-8 bg-gradient-to-b from-slate-100 to-white sm:to-slate-50 sm:mx-4 sm:rounded-md">
          <TeamSide
            side="home"
            logoUrl={data.match.homeTeam.logoUrl}
            name={data.match.homeTeam.name}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 shrink-0 w-20 pt-4">
            <div className="flex items-center gap-2 text-4xl font-bold tracking-tighter my-auto">
              <span>{data.match.homeScore}</span>
              <span>-</span>
              <span>{data.match.awayScore}</span>
            </div>
          </div>
          <TeamSide
            side="away"
            logoUrl={data.match.awayTeam.logoUrl}
            name={data.match.awayTeam.name}
          />
        </div>

        {/* 골 기록 */}
        {goalsWithScore.length > 0 && (
          <div className="px-4 sm:py-4">
            {goalsWithScore.map((goal, index) => (
              <div key={goal.id} className="flex items-center">
                {data.permissions.isEditable && (
                  <div className="text-sm font-medium size-9 sm:size-8 flex items-center text-gray-400 shrink-0">
                    {index + 1}
                  </div>
                )}
                <GoalItem
                  goal={goal}
                  scoreAtTime={goal.scoreAtTime}
                  isHome={goal.scorerSide === "HOME"}
                  hasPermission={data.permissions.isEditable}
                />
                {data.permissions.isEditable && (
                  <button
                    type="button"
                    className="text-sm font-medium size-9 sm:size-8 flex justify-center items-center cursor-pointer bg-destructive/5 rounded-md sm:hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <Trash2 className="size-4.5 text-destructive" />
                  </button>
                )}
              </div>
            ))}
            {/* <div className="flex justify-center items-center h-10 gap-6">
            <div className="flex items-center gap-1">
              <SoccerBallIcon className="size-4 text-gray-600" weight="fill" />
              <span className="text-sm font-medium">골</span>
            </div>
            <div className="flex items-center gap-1">
              <SoccerBallIcon
                className="size-4 text-destructive"
                weight="fill"
              />
              <span className="text-sm font-medium">자책골</span>
            </div>
          </div> */}
          </div>
        )}

        {/* 골 기록 입력 */}
        {data.permissions.isEditable && (
          <GoalRecord matchId={data.match.id} lineups={data.lineups} />
        )}

        {/* 출전 명단 */}
        <div className="px-4">
          <div className="w-full flex items-center justify-between h-14 sm:h-11 gap-3">
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
              {data.lineups.map((lineup, index) => (
                <LineupEditItem
                  key={lineup.id}
                  lineup={lineup}
                  index={index}
                  isMember={data.permissions.isMember}
                />
              ))}
            </div>
          )}

          {/* 관리 버튼들 */}
          {data.permissions.isEditable && (
            <div>
              {data.match.schedule.matchType === "SQUAD" ? (
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <button
                    type="button"
                    className="rounded-md px-3 w-full flex items-center h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors"
                    onClick={handleShuffleLineups}
                  >
                    <Dices className="size-5 text-gray-400" />
                    <span className="text-base font-medium">
                      랜덤 팀 나누기
                    </span>
                  </button>
                  <button
                    type="button"
                    className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCcw className="size-5 text-gray-400" />
                      <span className="text-base font-medium">
                        명단 업데이트
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:max-w-2/3">
                  <button
                    type="button"
                    className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="size-5 text-gray-400" />
                      <span className="text-base font-medium text-center">
                        사이드 변경
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="rounded-md px-3 w-full flex items-center justify-between h-12 sm:h-11 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 border transition-colors"
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
                className="my-4 rounded-md px-3 w-full flex items-center justify-center h-12 sm:h-11 gap-3 cursor-pointer bg-destructive/5 hover:bg-destructive/10 transition-colors text-destructive font-medium"
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
