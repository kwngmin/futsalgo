"use client";

import { LineupsData, LineupsWithNameData } from "@/entities/match/model/types";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Lineup = LineupsData | LineupsWithNameData;

const Lineup = ({
  lineups,
  side,
}: {
  lineups: Lineup;
  side: "home" | "away";
}) => {
  const router = useRouter();

  if (!lineups) {
    return <div className="text-center text-sm text-gray-500">미정</div>;
  }

  return (
    <div
      className={`py-2 ${side === "away" ? "border-l border-gray-100" : ""}`}
    >
      {lineups.length > 0 ? (
        lineups.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-2 px-3 h-14 select-none group cursor-pointer hover:bg-gray-50"
            onClick={() => router.push(`/players/${player.user.id}`)}
          >
            {player.user.image ? (
              <Image
                src={player.user.image}
                alt="player image"
                width={36}
                height={36}
                className="overflow-hidden object-cover size-8 sm:size-9 rounded-[42%] shrink-0"
              />
            ) : (
              <div className="size-10 rounded-md bg-gray-100"></div>
            )}
            <div className="w-full flex flex-col justify-center">
              <span className="text-sm font-semibold leading-tight group-hover:underline underline-offset-2">
                {player.user.nickname}
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
        ))
      ) : (
        <div className="text-center text-sm font-medium text-muted-foreground py-2 flex items-center justify-center h-14">
          명단이 없습니다.
        </div>
      )}
    </div>
  );
};

export default Lineup;
