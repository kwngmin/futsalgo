import { MatchWithDetails } from "@/entities/match/model/types";
import Image from "next/image";

type Lineup = MatchWithDetails["lineups"];

const Lineup = ({ lineups }: { lineups: Lineup }) => {
  if (!lineups) {
    return <div className="text-center text-sm text-gray-500">미정</div>;
  }

  return (
    <div className="space-y-6 border border-gray-100 rounded-md py-6 sm:grid grid-cols-2 sm:px-4">
      {lineups.length > 0 ? (
        lineups.map((player) => (
          <div key={player.id} className="flex flex-col items-center gap-1">
            {player.user.image ? (
              <Image
                src={player.user.image}
                alt="player image"
                width={48}
                height={48}
                className="overflow-hidden size-12 rounded-[42%]"
              />
            ) : (
              <div className="size-10 rounded-md bg-gray-100"></div>
            )}
            <span className="text-sm">{player.user.nickname}</span>
          </div>
        ))
      ) : (
        <div className="text-center text-sm font-medium text-muted-foreground">
          미정
        </div>
      )}
    </div>
  );
};

export default Lineup;
