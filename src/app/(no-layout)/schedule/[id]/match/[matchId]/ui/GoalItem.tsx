"use client";

import { SneakerMoveIcon, SoccerBallIcon } from "@phosphor-icons/react";
import type { GoalWithScore } from "../model/types";

// 골 기록 컴포넌트 (DRY 원칙 적용)
interface GoalItemProps {
  goal: GoalWithScore;
  scoreAtTime: string;
  isHome: boolean;
}

export const GoalItem = ({ goal, scoreAtTime, isHome }: GoalItemProps) => (
  <div className="flex justify-between py-3 border-b border-gray-100 last:border-b-0">
    {isHome ? (
      <>
        <div className="w-full flex flex-col">
          <div className="flex justify-end items-center gap-1">
            <span className="font-medium">
              {goal.isScoredByMercenary ? "용병" : goal.scorer?.nickname}
            </span>
            {/* <span className="text-sm text-muted-foreground">
              {goal.isOwnGoal ? "(자책골)" : ""}
            </span> */}
            <SoccerBallIcon
              className={`size-5 ${goal.isOwnGoal ? "text-destructive" : ""}`}
              weight="fill"
            />
          </div>
          {(goal.isAssistedByMercenary || goal.assistId) && (
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm">
                {goal.isAssistedByMercenary ? "용병" : goal.assist?.nickname}
              </span>
              <SneakerMoveIcon
                className="size-4 text-muted-foreground"
                weight="fill"
              />
            </div>
          )}
        </div>
        <div className="flex justify-center items-center w-12 shrink-0 h-6 leading-none">
          {scoreAtTime}
        </div>
        <div className="w-full" />
      </>
    ) : (
      <>
        <div className="w-full" />
        <div className="flex justify-center items-center w-12 shrink-0 h-6 leading-none">
          {scoreAtTime}
        </div>
        <div className="w-full flex flex-col">
          <div className="flex justify-start items-center gap-1">
            <SoccerBallIcon
              className={`size-5 ${goal.isOwnGoal ? "text-destructive" : ""}`}
              weight="fill"
            />
            <span className="font-medium">
              {goal.isScoredByMercenary ? "용병" : goal.scorer?.nickname}
            </span>
          </div>
          {(goal.isAssistedByMercenary || goal.assistId) && (
            <div className="flex justify-start items-center gap-2">
              <SneakerMoveIcon
                className="size-4 text-muted-foreground"
                weight="fill"
              />
              <span className="text-sm">
                {goal.isAssistedByMercenary ? "용병" : goal.assist?.nickname}
              </span>
            </div>
          )}
        </div>
      </>
    )}
  </div>
);
