import Image from "next/image";

const TeamSide = ({
  logoUrl,
  name,
}: {
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
      <span className="text-base tracking-tight font-semibold">
        {name || "팀 이름 없음"}
      </span>
    </div>
  );
};

export default TeamSide;
