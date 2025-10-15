"use client";

import { SneakerMoveIcon, SoccerBallIcon } from "@phosphor-icons/react";
import type { GoalWithScore } from "../model/types";

interface GoalItemProps {
  goal: GoalWithScore;
  scoreAtTime: string;
  isHome: boolean;
}

// 득점자 이름 표시 헬퍼 함수
const getScorerName = (
  isMercenary: boolean,
  scorer?: { nickname: string | null; isDeleted: boolean } | null
): string => {
  if (isMercenary) return "용병";
  if (!scorer) return "알 수 없음";
  if (scorer.isDeleted) return "탈퇴한 회원";
  return scorer.nickname ?? "알 수 없음";
};

// 어시스트 이름 표시 헬퍼 함수
const getAssistName = (
  isMercenary: boolean,
  assist?: { nickname: string | null; isDeleted: boolean } | null
): string => {
  if (isMercenary) return "용병";
  if (!assist) return "알 수 없음";
  if (assist.isDeleted) return "탈퇴한 회원";
  return assist.nickname ?? "알 수 없음";
};

export const GoalItem = ({ goal, scoreAtTime, isHome }: GoalItemProps) => {
  const scorerName = getScorerName(goal.isScoredByMercenary, goal.scorer);
  const assistName =
    goal.isAssistedByMercenary || goal.assistId
      ? getAssistName(goal.isAssistedByMercenary, goal.assist)
      : null;

  // 홈 팀 골 기록
  if (isHome) {
    return (
      <div className="flex justify-between items-center py-3 w-full min-h-14">
        <div className="w-full flex justify-end items-center gap-1.5">
          <div className="flex flex-col items-end">
            <span
              className={`leading-tight ${
                goal.scorer?.isDeleted
                  ? "text-muted-foreground font-medium"
                  : "font-semibold"
              }`}
            >
              {scorerName}
            </span>
            {goal.isOwnGoal && (
              <span className="text-sm text-destructive">자책골</span>
            )}
            {assistName && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground font-medium">
                  {assistName}
                </span>
                <SneakerMoveIcon
                  className="size-3 text-gray-600"
                  weight="fill"
                />
              </div>
            )}
          </div>
          <SoccerBallIcon
            className={`size-4 ${
              goal.isOwnGoal ? "text-destructive" : "text-gray-700"
            }`}
            weight="fill"
          />
        </div>

        <div className="flex justify-center items-center w-12 shrink-0 h-6 leading-none font-medium text-muted-foreground">
          {scoreAtTime}
        </div>
        <div className="w-full" />
      </div>
    );
  }

  // 원정 팀 골 기록
  return (
    <div className="flex justify-between items-center py-3 w-full min-h-14">
      <div className="w-full" />
      <div className="flex justify-center items-center w-12 shrink-0 h-6 leading-none font-medium text-muted-foreground">
        {scoreAtTime}
      </div>
      <div className="w-full flex justify-start items-center gap-1.5">
        <SoccerBallIcon
          className={`size-4 ${
            goal.isOwnGoal ? "text-destructive" : "text-gray-700"
          }`}
          weight="fill"
        />
        <div className="flex flex-col">
          <span
            className={`leading-tight ${
              goal.scorer?.isDeleted
                ? "text-muted-foreground font-medium"
                : "font-semibold"
            }`}
          >
            {scorerName}
          </span>
          {goal.isOwnGoal && (
            <span className="text-sm text-destructive">자책골</span>
          )}
          {assistName && (
            <div className="flex items-center gap-1">
              <SneakerMoveIcon className="size-3 text-gray-600" weight="fill" />
              <span className="text-sm text-muted-foreground font-medium">
                {assistName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
