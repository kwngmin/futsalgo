import Image from "next/image";
import { useRouter } from "next/navigation";

const TeamSide = ({
  logoUrl,
  name,
  teamId,
  label,
}: {
  logoUrl?: string | null;
  name?: string;
  teamId?: string;
  label?: string;
}) => {
  const router = useRouter();

  return (
    <div
      className="grow flex flex-col items-center gap-2 min-w-28 group select-none"
      onClick={() => {
        if (teamId) {
          router.push(`/teams/${teamId}`);
        }
      }}
    >
      <div>
        {logoUrl ? (
          <Image src={logoUrl} alt="home team logo" width={64} height={64} />
        ) : (
          <div className="size-16 rounded-full bg-gradient-to-br from-slate-300 to-gray-100 flex items-center justify-center text-2xl text-slate-700">
            {name?.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center">
        <span
          className={`text-base tracking-tight font-semibold ${
            teamId
              ? "group-hover:underline underline-offset-4 cursor-pointer"
              : ""
          }`}
        >
          {name || "팀 이름 없음"}
        </span>
        {label && <span className="text-sm text-gray-600">{label}</span>}
      </div>
    </div>
  );
};

export default TeamSide;
