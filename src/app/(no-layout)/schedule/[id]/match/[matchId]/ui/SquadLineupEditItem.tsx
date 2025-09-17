"use client";

import { useState } from "react";
import type { MatchDataLineup } from "../model/types";
import { updateLineupSide, removeFromLineup } from "../actions/match-actions";
import {
  CaretLeftIcon,
  CaretRightIcon,
  // ChairIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { LogOut } from "lucide-react";

interface LineupEditItemProps {
  lineup: MatchDataLineup;
  index: number;
  isMember: boolean;
}

export const SquadLineupEditItem = ({
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
    <div className="flex items-center gap-2 h-14 px-3 sm:px-4 border-b last:border-b-0 hover:bg-gray-50 group">
      <div className="hidden sm:flex items-center justify-center text-sm font-medium text-muted-foreground size-8 sm:size-9 shrink-0 pr-1">
        {index + 1}
      </div>
      <div className="flex justify-between gap-2 grow">
        <div className="flex items-center gap-2 grow">
          {lineup.user.image ? (
            <Image
              src={lineup.user.image}
              alt={lineup.user.nickname || lineup.user.name || ""}
              width={36}
              height={36}
              className="hidden sm:block size-8 rounded-full object-cover ring ring-gray-200"
            />
          ) : (
            <div className="hidden sm:block size-8 rounded-full bg-gray-200" />
          )}
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
        </div>
        <div className="flex items-center justify-end gap-2">
          <div className="grow grid grid-cols-3 gap-1 p-1 rounded-full bg-gray-100 select-none group-hover:bg-white group-hover:ring group-hover:ring-gray-300">
            <button
              type="button"
              disabled={isLoading}
              className={`text-sm rounded-full flex items-center gap-1 justify-center transition-colors tracking-tight disabled:opacity-50 disabled:cursor-not-allowed h-9 px-3 border ${
                lineup.side === "HOME"
                  ? "bg-white border-gray-400 pointer-events-none cursor-default hover:border-gray-400 font-medium"
                  : "border-transparent cursor-pointer hover:bg-gray-200"
              }`}
              onClick={() => handleSideChange("HOME")}
            >
              HOME
            </button>
            <button
              type="button"
              disabled={isLoading}
              className={`text-sm rounded-full flex items-center gap-1 justify-center transition-colors cursor-pointer tracking-tight disabled:opacity-50 disabled:cursor-not-allowed h-9 text-gray-600 hover:bg-gray-200`}
              onClick={() => handleSideChange("UNDECIDED")}
            >
              <CaretLeftIcon className="size-3 text-gray-400" weight="fill" />
              선택
              <CaretRightIcon className="size-3 text-gray-400" weight="fill" />
            </button>
            <button
              type="button"
              disabled={isLoading}
              className={`text-sm rounded-full flex items-center gap-1 justify-center transition-colors tracking-tight disabled:opacity-50 disabled:cursor-not-allowed h-9 px-3 border ${
                lineup.side === "AWAY"
                  ? "bg-white border-gray-400 pointer-events-none cursor-default hover:border-gray-400 font-medium"
                  : "border-transparent cursor-pointer hover:bg-gray-200"
              }`}
              onClick={() => handleSideChange("AWAY")}
            >
              AWAY
            </button>
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
      </div>
    </div>
  );
};
