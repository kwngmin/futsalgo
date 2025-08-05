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
  <div className="flex justify-between items-center py-3 border-t border-gray-100">
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
            <div className="flex justify-end items-center gap-1 mr-0.5">
              <span className="text-sm">
                {/* {goal.isAssistedByMercenary ? "용병" : goal.assist?.nickname} */}
                {`${
                  goal.isAssistedByMercenary ? "용병" : goal.assist?.nickname
                } 어시스트`}
              </span>
              {/* <SneakerMoveIcon className="size-4" weight="fill" /> */}
            </div>
          )}
        </div>
        <div className="flex justify-center items-center w-16 shrink-0 h-6 leading-none font-medium text-muted-foreground">
          {scoreAtTime}
        </div>
        <div className="w-full" />
      </>
    ) : (
      <>
        <div className="w-full" />
        <div className="flex justify-center items-center w-16 shrink-0 h-6 leading-none font-medium text-muted-foreground">
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
            <div className="flex justify-start items-center gap-1 ml-0.5">
              {/* <SneakerMoveIcon className="size-4" weight="fill" /> */}
              <span className="text-sm">
                {/* {goal.isAssistedByMercenary ? "용병" : goal.assist?.nickname} */}
                {`${
                  goal.isAssistedByMercenary ? "용병" : goal.assist?.nickname
                } 어시스트`}
              </span>
            </div>
          )}
        </div>
      </>
    )}
  </div>
);
