"use client";

import { useState } from "react";
import type { MatchDataLineup } from "../model/types";
import { removeFromLineup } from "../actions/match-actions";
import { LogOut } from "lucide-react";

interface LineupEditItemProps {
  lineup: MatchDataLineup;
  index: number;
  isMember: boolean;
}

export const TeamLineupEditItem = ({
  lineup,
  index,
  isMember,
}: LineupEditItemProps) => {
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="flex items-center gap-2 h-14 px-3 sm:px-4 border-b last:border-b-0 hover:bg-gray-50">
      <div className="hidden sm:flex items-center justify-center text-sm font-medium text-muted-foreground size-8 sm:size-9 shrink-0 pr-1">
        {index + 1}
      </div>
      <div className="grow flex flex-col justify-center">
        <span className="text-sm font-semibold leading-tight">
          {lineup.user.nickname}
        </span>
        {isMember && lineup.user.name && (
          <span className="text-sm font-medium text-muted-foreground leading-tight">
            {lineup.user.name}
          </span>
        )}
      </div>
      <button
        type="button"
        disabled={isLoading}
        className="flex items-center justify-center size-9 bg-destructive/5 rounded-md sm:hover:bg-destructive/10 transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        onClick={handleRemove}
      >
        <LogOut className="size-4.5 sm:size-4 text-destructive" />
      </button>
    </div>
  );
};
