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
      <div>
        {logoUrl ? (
          <Image src={logoUrl} alt="home team logo" width={64} height={64} />
        ) : (
          <div className="size-10 rounded-md bg-gray-100" />
        )}
      </div>
      <div className="flex flex-col items-center">
        <span className="text-base tracking-tight font-medium">
          {name || "팀 이름 없음"}
        </span>
        <div className="flex items-center gap-2">
          <div
            className={`size-2 rounded-full ${
              side === "home" ? "bg-indigo-600" : "bg-emerald-600"
            }`}
          />
          {/* <span className="grow font-medium text-sm tracking-tight text-muted-foreground">
            {side === "home" ? "홈 사이드" : "어웨이 사이드"}
          </span> */}
          <span
            className={`font-medium text-sm tracking-tight ${
              side === "home" ? "text-indigo-700" : "text-emerald-700"
            }`}
          >
            {side === "home" ? "홈" : "어웨이"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamSide;
