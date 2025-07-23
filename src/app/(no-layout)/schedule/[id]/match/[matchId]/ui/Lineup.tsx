import { MatchWithDetails } from "@/entities/match/model/types";
import Image from "next/image";

type Lineup = MatchWithDetails["lineups"];

const Lineup = ({ lineups }: { lineups: Lineup }) => {
  if (!lineups) {
    return <div className="text-center text-sm text-gray-500">미정</div>;
  }

  return (
    <div className="space-y-3 ">
      {lineups.length > 0 ? (
        lineups.map((player) => (
          <div key={player.id} className="flex flex-col items-center gap-1">
            {player.user.image ? (
              <Image
                src={player.user.image}
                alt="player image"
                width={56}
                height={56}
                className="overflow-hidden size-14 rounded-3xl"
              />
            ) : (
              <div className="size-10 rounded-md bg-gray-100"></div>
            )}
            <span className="text-sm">{player.user.nickname}</span>
          </div>
        ))
      ) : (
        <div className="text-center text-sm text-gray-500">미정</div>
      )}
    </div>
  );
};

export default Lineup;
