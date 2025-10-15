"use client";

import { LineupsData, LineupsWithNameData } from "@/entities/match/model/types";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type LineupItem = LineupsData[number] | LineupsWithNameData[number];

interface LineupProps {
  lineups: LineupsData | LineupsWithNameData;
  MercenaryCount: number | null;
}

// 플레이어 이름 표시 헬퍼 함수
const getPlayerName = (user: LineupItem["user"]): string => {
  if (user.isDeleted) return "탈퇴한 회원";
  return user.nickname ?? "알 수 없음";
};

const Lineup = ({ lineups, MercenaryCount }: LineupProps) => {
  const router = useRouter();

  if (!lineups) {
    return <div className="text-center text-sm text-gray-500">미정</div>;
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-white hover:border-gray-400 transition-colors">
      {/* 플레이어 목록 */}
      {lineups.length > 0 &&
        lineups.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center gap-2 px-3 sm:px-4 h-14 select-none group cursor-pointer hover:bg-gray-50 border-b last:border-b-0 border-gray-200"
            onClick={() => router.push(`/players/${player.user.id}`)}
          >
            <span className="text-sm text-gray-400/80 mr-0.5 sm:mr-1">
              {index + 1}
            </span>
            {player.user.image ? (
              <Image
                src={player.user.image}
                alt="player image"
                width={36}
                height={36}
                className="hidden sm:block object-cover size-8 sm:size-9 rounded-full shrink-0 ring ring-gray-200"
              />
            ) : (
              <div className="hidden sm:block size-9 rounded-full bg-gray-100 shrink-0"></div>
            )}
            <div className="w-full flex flex-col justify-center">
              <span
                className={`text-sm leading-tight group-hover:underline underline-offset-2 ${
                  player.user.isDeleted
                    ? "text-muted-foreground font-medium"
                    : "font-semibold"
                }`}
              >
                {getPlayerName(player.user)}
              </span>
              {/* 권한이 있는 경우에만 실명 표시 */}
              {"name" in player.user && (
                <span className="text-sm font-medium text-muted-foreground leading-tight">
                  {player.user.name}
                </span>
              )}
            </div>
            <ChevronRight className="hidden md:group-hover:block size-4 text-gray-500 shrink-0" />
          </div>
        ))}

      {/* 용병 목록 */}
      {MercenaryCount !== null &&
        MercenaryCount > 0 &&
        Array.from({ length: MercenaryCount }).map((_, index) => (
          <div
            key={`mercenary-${index}`}
            className="flex items-center gap-2 px-3 sm:px-4 h-14 select-none group border-b last:border-b-0 border-gray-200"
          >
            <span className="text-sm text-gray-400/80 mr-0.5 sm:mr-1">
              {lineups.length + index + 1}
            </span>
            <div className="hidden sm:flex items-center justify-center size-8 sm:size-9 rounded-full bg-slate-400/50">
              <div className="size-6 sm:size-7 rounded-full flex items-center justify-center overflow-hidden relative">
                <div className="absolute top-1 size-2.5 sm:size-3 bg-white rounded-full" />
                <div className="absolute bottom-0 w-5 sm:w-6 h-2 sm:h-2.5 bg-white rounded-t-full" />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              용병 {index + 1}
            </span>
          </div>
        ))}

      {/* 빈 명단 메시지 */}
      {lineups.length === 0 && !MercenaryCount && (
        <div className="text-center text-sm font-medium text-muted-foreground py-2 flex items-center justify-center h-14">
          명단이 없습니다.
        </div>
      )}
    </div>
  );
};

export default Lineup;
