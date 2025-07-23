import { TeamType } from "@prisma/client";
import Image from "next/image";

const TeamLogo = ({
  logoUrl,
  teamType,
}: {
  logoUrl: string;
  teamType: TeamType;
}) => {
  return (
    <div
      className=""
      // className={
      //   matchType === "TEAM"
      //     ? "flex flex-col items-center gap-2 w-24"
      //     : "w-full flex flex-col items-center gap-2 py-4 bg-gradient-to-b from-slate-100 to-transparent sm:from-transparent"
      // }
    >
      <Image
        src={logoUrl ?? ""}
        alt={`${teamType === "HOST" ? "Host" : "Invited"} Team Logo`}
        width={72}
        height={72}
        className="size-14 sm:size-16"
        // className={
        //   matchType === "TEAM"
        //     ? "size-16 mt-5 mb-1 sm:mt-4 sm:mb-0"
        //     : "mt-4 sm:size-16"
        // }
      />
      {/* <span className="sm:text-lg font-semibold">{teamName}</span> */}
    </div>
  );
};

export default TeamLogo;
