import { MatchWithDetails } from "@/entities/match/model/types";
import Image from "next/image";

type Lineup = MatchWithDetails["lineups"];

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
          <div key={player.id} className="flex items-center gap-2 px-3 py-2">
            {player.user.image ? (
              <Image
                src={player.user.image}
                alt="player image"
                width={32}
                height={32}
                className="overflow-hidden object-cover size-8 rounded-[42%]"
              />
            ) : (
              <div className="size-10 rounded-md bg-gray-100"></div>
            )}
            <span className="text-sm font-medium">{player.user.nickname}</span>
          </div>
        ))
      ) : (
        <div className="text-center text-sm font-medium text-muted-foreground py-2 flex items-center justify-center h-14 bg-gray-50 rounded-lg">
          명단이 없습니다.
        </div>
      )}
    </div>
  );
};

export default Lineup;
