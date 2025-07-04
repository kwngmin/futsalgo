import { getCurrentAge } from "@/entities/user/model/actions";
import { GENDER } from "@/entities/user/model/constants";
import { Separator } from "@/shared/components/ui/separator";
// import { Separator } from "@/shared/components/ui/separator";
import { User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

type PlayerCardProps = {
  player: User;
  isCurrentUser?: boolean;
  teamName?: string;
  teamLogoUrl?: string;
};

const PlayerCard = ({
  player,
  isCurrentUser = false,
  teamName,
  teamLogoUrl,
}: PlayerCardProps) => {
  const router = useRouter();
  console.log(player, "player");
  const age = getCurrentAge(player.birthDate as string);

  return (
    <div
      className={`bg-white rounded-2xl p-3 hover:bg-gray-50 transition-colors cursor-pointer relative flex items-center gap-2 ${
        isCurrentUser ? "ring ring-border" : ""
      }`}
      onClick={() => router.push(`/players/${player.id}`)}
    >
      {/* 프로필 이미지 */}
      {player.image ? (
        <div className="size-14 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <Image
            width={56}
            height={56}
            src={player.image}
            alt={player.nickname || "프로필 이미지"}
            className="size-14 p-0.5 rounded-full object-cover"
          />
        </div>
      ) : (
        <div className="size-14 bg-gray-400" />
      )}
      {/* {isCurrentUser && (
              <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-extrabold">나</span>
              </div>
            )} */}

      {/* 선수 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-lg sm:text-base font-semibold flex items-center gap-2 truncate leading-none h-6">
            {player.nickname}
          </h3>
          <div className="h-4 flex items-center gap-2 sm:text-sm mb-0.5 sm:mb-0 tracking-tight font-medium text-slate-600">
            <Separator orientation="vertical" />
            {`${GENDER[player.gender as keyof typeof GENDER]} ${
              player.birthDate
                ? age.success
                  ? `${age.age}세`
                  : "생년월일 미설정"
                : "생년월일 미설정"
            }`}
          </div>

          {/* <div className="flex items-center h-4 gap-2">
            <Separator orientation="vertical" />
            <span className="sm:text-sm mb-0.5 sm:mb-0 tracking-tight font-medium text-amber-600">
              {`${GENDER[player.gender as keyof typeof GENDER]} ${
                player.birthDate
                  ? age.success
                    ? `${age.age}세`
                    : "생년월일 미설정"
                  : "생년월일 미설정"
              }`}
            </span>
          </div> */}
        </div>
        {/* <p className="sm:text-sm font-medium tracking-tight text-sm text-muted-foreground line-clamp-1">
          {teamName || "소속 팀 없음"}
        </p> */}
        <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-3">
          <div className="w-full sm:text-sm font-medium tracking-tight flex items-center gap-1 text-muted-foreground">
            {teamLogoUrl ? (
              <div className="size-5 sm:size-4 text-gray-700">
                <Image
                  width={24}
                  height={24}
                  src={teamLogoUrl}
                  alt="team logo"
                  className="size-5 sm:size-4 rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="size-5 sm:size-4 p-0.5">
                <div className="size-full bg-gray-100 rounded-full" />
              </div>
            )}
            {teamName || "소속 팀 없음"}
            {/* {`${TEAM_GENDER[team.gender as keyof typeof TEAM_GENDER]}`}
            {`${
              Boolean(team.stats?.professionalCount)
                ? `선출포함 ${team._count.members}명`
                : `${team._count.members}명`
            } • ${`${formatCityName(team.city)} ${team.district}`}`} */}
          </div>
        </div>
      </div>

      {/* 참가 경기수 */}
      {/* {!isCurrentUser && (
        <div className="text-center flex-shrink-0 w-12 text-lg font-semibold text-gray-900 my-auto">
          {player.totalMatches}
        </div>
      )} */}
    </div>
  );
};

export default PlayerCard;
