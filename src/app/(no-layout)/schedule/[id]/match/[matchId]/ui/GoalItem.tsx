"use client";

import {
  //   SneakerMoveIcon, //
  SoccerBallIcon,
} from "@phosphor-icons/react";
import type { GoalWithScore } from "../model/types";

// 골 기록 컴포넌트 (DRY 원칙 적용)
interface GoalItemProps {
  goal: GoalWithScore;
  scoreAtTime: string;
  isHome: boolean;
}

export const GoalItem = ({ goal, scoreAtTime, isHome }: GoalItemProps) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 w-full min-h-16">
    {isHome ? (
      <>
        <div className="w-full flex justify-end items-center gap-1.5">
          <div className="flex flex-col items-end">
            <span className="text-sm sm:text-base font-semibold leading-tight">
              {goal.isScoredByMercenary ? "용병" : goal.scorer?.nickname}
            </span>
            {goal.isOwnGoal && (
              <span className="text-sm text-muted-foreground font-medium">
                자책골
              </span>
            )}
            {(goal.isAssistedByMercenary || goal.assistId) && (
              <span className="text-sm text-muted-foreground font-medium">
                {goal.isAssistedByMercenary ? "용병" : goal.assist?.nickname}
                {/* {`${
                    goal.isAssistedByMercenary ? "용병" : goal.assist?.nickname
                  } 어시스트`} */}
              </span>
            )}
          </div>
          <SoccerBallIcon
            className={`size-4 ${goal.isOwnGoal ? "text-destructive" : ""}`}
            weight="fill"
          />
        </div>

        <div className="flex justify-center items-center w-14 shrink-0 h-6 leading-none font-medium text-muted-foreground">
          {scoreAtTime}
        </div>
        <div className="w-full" />
      </>
    ) : (
      <>
        <div className="w-full" />
        <div className="flex justify-center items-center w-14 shrink-0 h-6 leading-none font-medium text-muted-foreground">
          {scoreAtTime}
        </div>
        <div className="w-full flex justify-start items-center gap-1.5">
          <SoccerBallIcon
            className={`size-4 ${goal.isOwnGoal ? "text-destructive" : ""}`}
            weight="fill"
          />
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-semibold leading-tight">
              {goal.isScoredByMercenary ? "용병" : goal.scorer?.nickname}
            </span>
            {goal.isOwnGoal && (
              <span className="text-sm text-muted-foreground font-medium">
                자책골
              </span>
            )}
            {(goal.isAssistedByMercenary || goal.assistId) && (
              <span className="text-sm text-muted-foreground font-medium">
                {goal.isAssistedByMercenary ? "용병" : goal.assist?.nickname}
                {/* {`${
                    goal.isAssistedByMercenary ? "용병" : goal.assist?.nickname
                  } 어시스트`} */}
              </span>
            )}
          </div>
        </div>
      </>
    )}
  </div>
);
