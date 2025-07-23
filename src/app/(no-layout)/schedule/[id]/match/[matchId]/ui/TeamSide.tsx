import Image from "next/image";

const TeamSide = ({
  side,
  logoUrl,
  name,
}: {
  side: "home" | "away";
  logoUrl?: string | null;
  name?: string;
}) => {
  return (
    <div className="grow flex flex-col items-center gap-2 min-w-28 pb-4">
      <h3 className="text-lg text-slate-500">
        {/* {side === "home" ? "HOME" : "AWAY"} */}
        {side === "home" ? "홈" : "어웨이"}
      </h3>
      <div>
        {logoUrl ? (
          <Image src={logoUrl} alt="home team logo" width={32} height={32} />
        ) : (
          <div className="size-10 rounded-md bg-gray-100" />
        )}
      </div>
      <span className="text-xs font-medium tracking-tight">
        {name || "팀 이름 없음"}
      </span>
    </div>
  );
};

export default TeamSide;
