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
  console.log(teamName);
  return (
    <div
      className={
        matchType === "TEAM"
          ? "flex flex-col items-center gap-2 w-28 sm:w-24"
          : "w-full flex flex-col items-center gap-2 py-4 bg-gradient-to-b from-slate-100 to-transparent sm:from-transparent"
      }
    >
      <Image
        src={logoUrl ?? ""}
        alt={`${teamType === "HOST" ? "Host" : "Invited"} Team Logo`}
        width={88}
        height={88}
        className="sm:size-16 mt-4"
      />
      {/* <span className="sm:text-lg font-semibold">{teamName}</span> */}
    </div>
  );
};

export default TeamLogo;
