import { MatchWithDetails } from "@/entities/match/model/types";
import Image from "next/image";

type Lineup = MatchWithDetails["lineups"];

const Lineup = ({ lineups }: { lineups: Lineup }) => {
  if (!lineups) {
    return <div className="text-center text-sm text-gray-500">미정</div>;
  }

  return (
    <div className="py-2">
      {lineups.length > 0 ? (
        lineups.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-2 p-2 border-b border-gray-100 last:border-0"
          >
            {player.user.image ? (
              <Image
                src={player.user.image}
                alt="player image"
                width={40}
                height={40}
                className="overflow-hidden size-10 rounded-[42%]"
              />
            ) : (
              <div className="size-10 rounded-md bg-gray-100"></div>
            )}
            <span className="text-sm font-medium">{player.user.nickname}</span>
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
