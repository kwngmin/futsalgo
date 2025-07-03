"use client";
import { TEAM_GENDER } from "@/entities/team/model/constants";
import { Team } from "@prisma/client";
import { Blend, Mars, Venus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCityName } from "@/entities/team/lib/format-city-name";

const TeamCard = ({
  team,
}: {
  team: Team & {
    _count: {
      members: number;
    };
    stats?: {
      professionalCount: number;
    };
  };
}) => {
  const router = useRouter();

  return (
    <div
      className="border-t border-gray-100 first:border-t-0 p-3 hover:bg-gray-50 transition-colors cursor-pointer relative flex items-center gap-1"
      onClick={() => router.push(`/teams/${team.id}`)}
    >
      {/* 팀 로고 */}
      <div className="size-14 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
        {team.logoUrl ? (
          <Image src={team.logoUrl} alt={team.name} width={56} height={56} />
        ) : (
          <div className="size-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
            {team.name.charAt(0)}
          </div>
        )}
      </div>

      {/* 팀 정보 */}
      <div className="flex flex-col items-start justify-center grow">
        <h3 className="text-lg sm:text-base font-semibold flex items-center gap-2 truncate leading-none h-6">
          {team.name}
          {/* {isMyTeam && (
              <div className="flex items-center gap-0.5 rounded px-1 bg-slate-500/10 h-5 border border-slate-300 mb-0.5">
                <span className="text-xs text-slate-800 font-semibold tracking-tight">
                  소속 팀
                </span>
              </div>
            )} */}
        </h3>
        <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-3">
          <div className="w-full sm:text-sm font-medium tracking-tight flex items-center gap-1 text-muted-foreground">
            {team.gender === "MALE" ? (
              <Mars className="size-4 text-sky-700" />
            ) : team.gender === "FEMALE" ? (
              <Venus className="size-4 text-pink-700" />
            ) : (
              <Blend className="size-4 text-gray-700" />
            )}
            {`${TEAM_GENDER[team.gender as keyof typeof TEAM_GENDER]}`}
            {/* <Users className="size-4 text-gray-700" /> */} •{" "}
            {`${
              Boolean(team.stats?.professionalCount)
                ? `선출포함 ${team._count.members}명`
                : `${team._count.members}명`
            } • ${`${formatCityName(team.city)} ${team.district}`}`}
          </div>
        </div>
      </div>

      {/* 상단 리본 */}
      {(team.recruitmentStatus === "RECRUITING" ||
        team.stats?.professionalCount) && (
        <div className="absolute right-4 top-0 flex rounded-b overflow-hidden">
          {team.recruitmentStatus === "RECRUITING" && (
            <div className="flex items-center gap-0.5 bg-indigo-500/10 px-2 h-8">
              <span className="text-sm text-indigo-700 font-medium tracking-tight">
                팀원 모집중
              </span>
            </div>
          )}
          {/* {Boolean(team.stats?.professionalCount) && (
                <div className="flex items-center gap-0.5 bg-sky-500/5 rounded px-1.5 h-5 sm:h-6">
                  <span className="text-xs sm:text-sm text-sky-700 font-medium tracking-tight">
                    {`선출 ${team.stats?.professionalCount}명`}
                  </span>
                </div>
              )} */}
          {false && (
            <div className="flex items-center gap-0.5 bg-teal-500/5 rounded px-1.5 h-5 sm:h-6">
              <span className="text-xs sm:text-sm text-teal-700 font-semibold tracking-tight">
                팀전 신청 가능
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamCard;
