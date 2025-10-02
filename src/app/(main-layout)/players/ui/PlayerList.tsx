import { getCurrentAge } from "@/entities/user/model/actions";
import { GENDER } from "@/entities/user/model/constants";
import InjuredBadge from "@/shared/components/ui/InjuredBadge";
import { User } from "@prisma/client";
import { Mars, Venus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type PlayerListProps = {
  player: User;
  isCurrentUser?: boolean;
  teamName?: string;
  teamLogoUrl?: string;
};

const PlayerList = ({
  player,
  isCurrentUser = false,
  teamName,
  teamLogoUrl,
}: PlayerListProps) => {
  const age = getCurrentAge(player.birthDate as string);

  return (
    <Link
      className="px-4 py-1.5 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer relative flex items-center gap-3"
      href={`/players/${player.id}`}
    >
      {/* 프로필 이미지 */}
      {player.image ? (
        <div className="size-14 flex items-center justify-center flex-shrink-0 relative">
          <Image
            width={56}
            height={56}
            src={player.image}
            alt={player.nickname || "프로필 이미지"}
            className="size-14 rounded-full object-cover border"
            priority={isCurrentUser}
            loading={isCurrentUser ? "eager" : "lazy"}
          />
          {isCurrentUser && (
            <div className="absolute -top-0.5 -left-0.25 size-5 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">나</span>
            </div>
          )}
          {player.condition === "INJURED" && <InjuredBadge />}
        </div>
      ) : (
        <div className="size-14 bg-gray-400" />
      )}

      {/* 사용자 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold flex items-center gap-2 truncate leading-none h-6">
            {player.nickname}
          </h3>
          <div className="h-4 flex items-center text-sm text-gray-800 gap-2">
            {/* <Separator orientation="vertical" className="!h-3 bg-gray-300" /> */}
            <div className="flex items-center gap-1 tracking-tight">
              {player.gender === "MALE" ? (
                <Mars className="size-3.5 text-sky-700" />
              ) : (
                <Venus className="size-3.5 text-pink-700" />
              )}
              {`${GENDER[player.gender as keyof typeof GENDER]} • ${
                player.birthDate
                  ? age.success
                    ? `${age.age}살`
                    : "생년월일 미설정"
                  : "생년월일 미설정"
              }`}
            </div>
          </div>
        </div>

        {/* 팀 정보 */}
        <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-3">
          <div className="w-full text-sm tracking-tight flex items-center gap-1 text-gray-700">
            {teamLogoUrl ? (
              <Image
                width={16}
                height={16}
                src={teamLogoUrl}
                alt="team logo"
                className="size-4 rounded-full object-cover"
              />
            ) : (
              <div className="bg-gradient-to-br from-slate-300 to-gray-100 rounded-full size-4" />
            )}
            <span className="text-gray-600 font-medium">
              {teamName || "소속 팀 없음"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlayerList;
