"use client";

import { Minus } from "lucide-react";
import type { MatchDataLineup } from "../model/types";

// 라인업 편집 컴포넌트
interface LineupEditItemProps {
  lineup: MatchDataLineup;
  index: number;
  isMember: boolean;
}

export const LineupEditItem = ({
  lineup,
  index,
  isMember,
}: LineupEditItemProps) => (
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
        <div className="grow grid grid-cols-2 p-0.5 rounded-md bg-gray-100">
          <div
            className={`text-sm rounded-sm flex items-center justify-center h-8 transition-colors cursor-pointer tracking-tight ${
              lineup.side === "HOME"
                ? "bg-white border shadow-xs font-semibold text-indigo-700"
                : "text-muted-foreground font-medium hover:text-gray-700"
            }`}
          >
            홈{/* HOME */}
          </div>
          <div
            className={`text-sm rounded-sm flex items-center tracking-tight justify-center h-8 transition-colors cursor-pointer ${
              lineup.side === "AWAY"
                ? "bg-white border shadow-xs font-semibold text-emerald-700"
                : "text-muted-foreground font-medium hover:text-gray-700"
            }`}
          >
            어웨이
            {/* AWAY */}
          </div>
        </div>
        <div className="flex items-center justify-center size-9 bg-destructive/5 rounded-md sm:hover:bg-destructive/10 transition-colors cursor-pointer group">
          <Minus className="size-4.5 sm:size-4 text-destructive" />
        </div>
      </div>
    </div>
  </div>
);
