import { LineupsData, LineupsWithNameData } from "@/entities/match/model/types";
import Image from "next/image";

type Lineup = LineupsData | LineupsWithNameData;

const Lineup = ({
  lineups,
  side,
}: {
  lineups: Lineup;
  side: "home" | "away";
}) => {
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
            className="flex flex-col justify-center items-center gap-1 px-3 h-24"
          >
            {player.user.image ? (
              <Image
                src={player.user.image}
                alt="player image"
                width={48}
                height={48}
                className="overflow-hidden object-cover size-10 rounded-[42%] shrink-0"
              />
            ) : (
              <div className="size-10 rounded-md bg-gray-100"></div>
            )}
            <div className="flex flex-col justify-center items-center">
              <span className="text-sm font-medium leading-tight">
                {player.user.nickname}
              </span>
              {/* 권한이 있는 경우에만 실명 표시 */}
              {"name" in player.user && (
                <span className="text-sm font-medium text-muted-foreground leading-tight">
                  {player.user.name}
                </span>
              )}
            </div>
            {/* {data.permissions.isMember && "name" in player.user && (
              <span className="font-medium text-muted-foreground">
                {player.user.name}
              </span>
            )} */}
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
