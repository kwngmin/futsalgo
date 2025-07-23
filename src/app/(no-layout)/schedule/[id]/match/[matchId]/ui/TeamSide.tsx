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
      <h3 className="font-medium px-2 py-1 w-full text-center">
        {/* {side === "home" ? "HOME" : "AWAY"} */}
        {side === "home" ? "홈 팀" : "어웨이 팀"}
      </h3>
      <div>
        {logoUrl ? (
          <Image src={logoUrl} alt="home team logo" width={72} height={72} />
        ) : (
          <div className="size-10 rounded-md bg-gray-100" />
        )}
      </div>
      <span className="text-sm tracking-tight">{name || "팀 이름 없음"}</span>
    </div>
  );
};

export default TeamSide;
