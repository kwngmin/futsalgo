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
    <div className="grow flex flex-col items-center gap-2 min-w-28">
      <div className="flex items-center justify-center gap-2 px-3 py-1 text-center bg-white rounded-full mb-2 shadow-xs">
        <div
          className={`size-2.5 rounded-full ${
            side === "home" ? "bg-indigo-600" : "bg-emerald-600"
          }`}
        />
        <span
          className={`grow font-medium text-sm tracking-tight ${
            side === "home" ? "text-indigo-700" : "text-emerald-700"
          }`}
        >
          {side === "home" ? "홈" : "어웨이"}
          {/* {side === "home" ? "HOME" : "AWAY"} */}
        </span>
      </div>
      <div>
        {logoUrl ? (
          <Image src={logoUrl} alt="home team logo" width={64} height={64} />
        ) : (
          <div className="size-10 rounded-md bg-gray-100" />
        )}
      </div>
      <span className="text-sm tracking-tight font-medium">
        {name || "팀 이름 없음"}
      </span>
    </div>
  );
};

export default TeamSide;
