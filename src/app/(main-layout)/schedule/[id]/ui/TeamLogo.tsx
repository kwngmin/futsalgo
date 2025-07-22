import { MatchType, TeamType } from "@prisma/client";
import Image from "next/image";

const TeamLogo = ({
  logoUrl,
  teamName,
  teamType,
  matchType,
}: {
  logoUrl: string;
  teamName: string;
  teamType: TeamType;
  matchType: MatchType;
}) => {
  return (
    <div
      className={
        matchType === "TEAM"
          ? "grow flex flex-col items-center gap-2 w-28 sm:w-36"
          : "w-full flex flex-col items-center gap-2 py-4 bg-gradient-to-b from-slate-100 to-transparent sm:from-transparent"
      }
    >
      <Image
        src={logoUrl ?? ""}
        alt={`${teamType === "HOST" ? "Host" : "Invited"} Team Logo`}
        width={100}
        height={100}
        className="size-20 mt-4"
      />
      <span className="sm:text-lg font-semibold">{teamName}</span>
    </div>
  );
};

export default TeamLogo;
