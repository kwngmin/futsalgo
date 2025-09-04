"use client";

import { LineupsData, LineupsWithNameData } from "@/entities/match/model/types";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Lineup = LineupsData | LineupsWithNameData;

const Lineup = ({
  lineups,
}: // side,
{
  lineups: Lineup;
  // side: "home" | "away";
}) => {
  const router = useRouter();

  if (!lineups) {
    return <div className="text-center text-sm text-gray-500">미정</div>;
  }

  return (
    <div className="border rounded-2xl overflow-hidden">
      {/* <div className="font-medium text-muted-foreground py-2 flex gap-2 items-center px-4 h-11 bg-gray-50 border-b border-gray-200">
        <div
          className={`size-2 rounded-full ${
            side === "home" ? "bg-indigo-600" : "bg-emerald-600"
          }`}
        />
        <span
          className={`${
            side === "home" ? "text-indigo-700" : "text-emerald-700"
          }`}
        >
          {side === "home" ? "홈" : "어웨이"}
        </span>
      </div> */}
      {lineups.length > 0 ? (
        lineups.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-2 px-3 sm:px-4 h-14 select-none group cursor-pointer hover:bg-gray-50 border-b last:border-b-0 border-gray-200"
            onClick={() => router.push(`/players/${player.user.id}`)}
          >
            {player.user.image ? (
              <Image
                src={player.user.image}
                alt="player image"
                width={36}
                height={36}
                className="object-cover size-8 sm:size-9 rounded-full shrink-0 ring ring-gray-200"
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
