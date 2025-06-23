import { User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

type PlayerCardProps = {
  player: User;
  isCurrentUser?: boolean;
  teamName?: string;
};

const PlayerCard = ({
  player,
  isCurrentUser = false,
  teamName,
}: PlayerCardProps) => {
  const router = useRouter();
  return (
    <div
      className="bg-white rounded-2xl p-3 hover:shadow-sm/5 transition-shadow cursor-pointer "
      onClick={() => router.push(`/players/${player.id}`)}
    >
      <div className="flex items-start gap-3">
        {/* 프로필 이미지 */}
        <div className="relative">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {player.image ? (
              <Image
                width={48}
                height={48}
                src={player.image}
                alt={player.nickname || "프로필 이미지"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 text-gray-400" />
            )}
          </div>
          {/* {isCurrentUser && (
              <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-extrabold">나</span>
              </div>
            )} */}
        </div>

        {/* 선수 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base truncate mb-0.5">
              {player.nickname}
            </h3>
            {/* 남성, 여성 구분 */}
            {/* <span
              className={`size-5 flex items-center justify-center text-xs font-semibold rounded flex-shrink-0 ${
                player.gender === "MALE"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-pink-50 text-pink-600"
              }`}
            >
              {player.gender === "MALE" ? "M" : "F"}
            </span> */}
            {/* 팔로잉 표시 (현재 사용자가 아닐 때만) */}
            {/* {!isCurrentUser && player.isFollowing && (
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-800 rounded-full flex-shrink-0 outline outline-slate-200">
                팔로잉
              </span>
            )} */}
          </div>
          <p className="text-gray-600 text-sm line-clamp-1">
            {teamName || "소속 팀 없음"}
            {/* 소속 팀 없음 */}
          </p>
        </div>

        {/* 참가 경기수 */}
        {!isCurrentUser && (
          <div className="text-center flex-shrink-0 w-12 text-lg font-semibold text-gray-900 my-auto">
            {/* {player.totalMatches} */}0
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
