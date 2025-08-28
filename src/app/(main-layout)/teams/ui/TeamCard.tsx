"use client";
import { TEAM_GENDER } from "@/entities/team/model/constants";
import { Team } from "@prisma/client";
import { Blend, ChevronRight, Mars, Venus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCityName } from "@/entities/team/lib/format-city-name";

const TeamCard = ({
  team,
  size = "md",
}: {
  team: Team & {
    _count: {
      members: number;
    };
    stats?: {
      professionalCount: number;
    };
  };
  size?: "sm" | "md";
}) => {
  const router = useRouter();

  return (
    <div
      className={`${
        size === "md" ? "py-1.5" : "py-3 border-t first:border-t-0"
      } gap-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer relative flex items-center`}
      onClick={() => router.push(`/teams/${team.id}`)}
    >
      {/* 팀 로고 */}
      <div
        className={`${
          size === "md" ? "size-14" : "size-10"
        } rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}
      >
        {team.logoUrl ? (
          <Image
            src={team.logoUrl}
            alt={team.name}
            width={size === "md" ? 56 : 40}
            height={size === "md" ? 56 : 40}
          />
        ) : (
          <div
            className={`${
              size === "md" ? "size-14" : "size-10"
            } bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}
          >
            {team.name.charAt(0)}
          </div>
        )}
      </div>

      {/* 팀 정보 */}
      <div className="flex flex-col items-start justify-center grow">
        <h3
          className={`${
            size === "md" ? "text-base font-medium" : "font-medium"
          } flex items-center gap-2 truncate leading-none h-6`}
        >
          {team.name}
          <span className="text-sm font-medium text-amber-600 mb-0.5">
            {team._count.members}
          </span>
        </h3>
        <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-3">
          <div
            className={`${
              size === "md" ? "text-sm" : "text-sm mb-0.5"
            } w-full tracking-tight flex items-center gap-1 text-muted-foreground font-medium`}
          >
            {team.gender === "MALE" ? (
              <Mars className="size-4 text-sky-700" />
            ) : team.gender === "FEMALE" ? (
              <Venus className="size-4 text-pink-700" />
            ) : (
              <Blend className="size-4 text-gray-700" />
            )}
            {`${TEAM_GENDER[team.gender as keyof typeof TEAM_GENDER]}`}
            {/* <Users className="size-4 text-gray-700" /> */}
            {`${
              Boolean(team.stats?.professionalCount)
                ? ` • 선출 ${team.stats?.professionalCount}명`
                : ""
            } • ${`${formatCityName(team.city)} ${team.district}`}`}
            {/* {`${
              Boolean(team.stats?.professionalCount)
                ? `선출포함 ${team._count.members}명`
                : `${team._count.members}명`
            } • ${`${formatCityName(team.city)} ${team.district}`}`} */}
          </div>
        </div>
      </div>

      {/* 상단 리본 */}
      {/* {(team.recruitmentStatus === "RECRUITING" ||
        team.stats?.professionalCount) && (
        <div className="absolute right-4 top-0 flex rounded-b overflow-hidden">
          {team.recruitmentStatus === "RECRUITING" && (
            <div className="flex items-center gap-0.5 bg-indigo-500/10 px-2 h-8">
              <span className="text-sm text-indigo-700 font-medium tracking-tight">
                팀원 모집중
              </span>
            </div>
          )}
        </div>
      )} */}

      {team.recruitmentStatus === "RECRUITING" && (
        <div className="flex items-center">
          <div className="flex justify-center items-center gap-0.5 px-1.5 h-12">
            {/* <span className="text-xs sm:text-sm text-teal-700 font-semibold tracking-tight">
            팀전 신청 가능
          </span> */}
            <span className="text-sm text-indigo-700 font-semibold tracking-tight">
              모집중
            </span>
          </div>
          {size === "sm" && <ChevronRight className="size-5 text-gray-500" />}
        </div>
      )}
    </div>
  );
};

export default TeamCard;
