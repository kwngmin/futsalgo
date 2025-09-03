"use client";

import { Minus } from "lucide-react";
import { useState } from "react";
import type { MatchDataLineup } from "../model/types";
import { updateLineupSide, removeFromLineup } from "../actions/match-actions";

interface LineupEditItemProps {
  lineup: MatchDataLineup;
  index: number;
  isMember: boolean;
}

export const LineupEditItem = ({
  lineup,
  index,
  isMember,
}: LineupEditItemProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSideChange = async (side: "HOME" | "AWAY" | "UNDECIDED") => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await updateLineupSide(lineup.id, side);
      if (!result.success) {
        console.error(result.error);
        alert("사이드 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("사이드 변경 오류:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (isLoading) return;

    if (!confirm(`${lineup.user.nickname}님을 명단에서 제외하시겠습니까?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await removeFromLineup(lineup.id);
      if (!result.success) {
        console.error(result.error);
        alert("선수 제거에 실패했습니다.");
      }
    } catch (error) {
      console.error("선수 제거 오류:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 py-3 border-y border-gray-100">
      <div className="flex items-center justify-center size-6 text-sm font-medium text-muted-foreground">
        {index + 1}
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 grow">
        <div className="flex gap-2 items-center">
          <span className="font-semibold">{lineup.user.nickname}</span>
          {isMember && lineup.user.name && (
            <span className="font-medium text-muted-foreground">
              {lineup.user.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:min-w-72">
          <div className="grow grid grid-cols-3 p-0.5 rounded-md bg-gray-100">
            <button
              type="button"
              disabled={isLoading}
              className={`text-sm rounded-sm flex items-center justify-center h-9 sm:h-8 transition-colors cursor-pointer tracking-tight disabled:opacity-50 disabled:cursor-not-allowed ${
                lineup.side === "HOME"
                  ? "bg-white border shadow-xs font-semibold text-indigo-700"
                  : "text-muted-foreground font-medium hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleSideChange("HOME")}
            >
              홈
            </button>
            <button
              type="button"
              disabled={isLoading}
              className={`text-sm rounded-sm flex items-center tracking-tight justify-center h-9 sm:h-8 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                lineup.side === "AWAY"
                  ? "bg-white border shadow-xs font-semibold text-emerald-700"
                  : "text-muted-foreground font-medium hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleSideChange("AWAY")}
            >
              어웨이
            </button>
            <button
              type="button"
              disabled={isLoading}
              className={`text-sm rounded-sm flex items-center tracking-tight justify-center h-9 sm:h-8 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                lineup.side === "UNDECIDED"
                  ? "bg-white border shadow-xs font-semibold text-slate-700"
                  : "text-muted-foreground font-medium hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleSideChange("UNDECIDED")}
            >
              휴식
            </button>
          </div>
          <button
            type="button"
            disabled={isLoading}
            className="flex items-center justify-center size-10 sm:size-9 bg-destructive/5 rounded-md sm:hover:bg-destructive/10 transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRemove}
          >
            <Minus className="size-4.5 sm:size-4 text-destructive" />
          </button>
        </div>
      </div>
    </div>
  );
};
