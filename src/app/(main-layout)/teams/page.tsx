"use client";

// import { useState } from "react";
import {
  Search, //
  ArrowDownUp,
  Mars,
  Venus,
  Blend,

  // UserRoundPlus,
} from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTeams, GetTeamsResponse } from "./model/actions";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SkeletonContent from "./ui/SkeletonTeamContent";
import { Team } from "@prisma/client";
import { TEAM_GENDER } from "@/entities/team/model/constants";
import { Separator } from "@/shared/components/ui/separator";

// type FilterType = "all" | "male" | "female";

const TeamsPage = () => {
  const router = useRouter();
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";
  // const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  // 필터에 따라 팀 목록 필터링
  // const filteredTeams = teams.filter((team) => {
  //   if (selectedFilter === "all") return true;
  //   return team.gender === selectedFilter;
  // });

  // 필터 옵션들
  // const filterOptions = [
  //   { id: "all", label: "전체" },
  //   { id: "male", label: "남성" },
  //   { id: "female", label: "여성" },
  // ];

  const { data, isLoading, error } = useQuery<GetTeamsResponse>({
    queryKey: ["teams"],
    queryFn: getTeams,
    placeholderData: keepPreviousData,
  });

  console.log(data, "data");
  console.log(isLoading, "isLoading");
  console.log(error, "error");

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-6 h-16 shrink-0">
        <h1 className="text-2xl font-bold">팀</h1>
        <div className="flex items-center gap-2">
          <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
            <Search className="w-5 h-5" />
          </button>
          <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
            <ArrowDownUp className="w-5 h-5" />
          </button>
        </div>
      </div>
      {data ? (
        <div className="px-3 space-y-3">
          <div>
            {isLoggedIn ? (
              data?.data?.myTeams && data?.data?.myTeams.length > 0 ? (
                <div className="space-y-3">
                  {data?.data?.myTeams.map((team) => (
                    <TeamCard key={team.id} team={team} isMyTeam />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-200 rounded-2xl p-4">
                  {/* <h3 className="font-semibold text-gray-900">
                  소속된 팀이 존재하지 않습니다
                </h3> */}
                  <div className="flex gap-2 justify-center">
                    <button
                      className="text-base bg-black text-white px-6 min-w-28 py-1.5 rounded-full font-bold cursor-pointer"
                      onClick={() => router.push("/teams/create")}
                    >
                      팀 만들기
                    </button>
                    <button
                      className="text-base bg-white px-6 min-w-28 py-1.5 rounded-full font-semibold cursor-pointer"
                      // onClick={() => signIn()}
                    >
                      팀 가입하기
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-8 bg-gray-200 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900">
                  원활한 서비스 이용을 위해 로그인이 필요합니다
                </h3>
                <div className="flex gap-2 justify-center mt-3">
                  <button
                    className="text-base bg-black text-white px-6 min-w-28 py-1.5 rounded-full font-bold cursor-pointer"
                    onClick={() => signIn()}
                  >
                    시작하기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 내 팀 섹션 */}
          {/* <div>
          {myTeams.length > 0 ? (
            <div className="space-y-3">
              {myTeams.map((team) => (
                <TeamCard key={team.id} team={team} isMyTeam />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-100 rounded-2xl p-4">
              <h3 className="font-medium text-gray-900">
                소속된 팀이 없습니다
              </h3>
              <p className="text-gray-500 text-sm">
                새로운 팀을 만드시거나 팀 코드를 입력하여 가입해보세요.
              </p>
              <div className="flex gap-2 justify-center mt-3">
                <button className="text-sm bg-black text-white px-4 min-w-28 py-1.5 rounded-full font-bold cursor-pointer">
                  팀 만들기
                </button>
                <button className="text-sm bg-white text-black px-4 min-w-28 py-1.5 rounded-full cursor-pointer">
                  팀 코드 입력
                </button>
              </div>
            </div>
          )}
        </div> */}

          {/* 다른 팀 섹션 */}
          <div className="flex flex-col gap-2">
            {/* 하단: 필터 칩들 */}
            {/* <div className="flex items-center gap-2 justify-between hidden">
              <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedFilter(option.id as FilterType)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                      selectedFilter === option.id
                        ? "bg-black text-white font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div> */}

            {/* 선수 목록 헤더 */}
            {/* <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium px-2 text-gray-600">
                팀 • {data?.data?.teams.length}
              </h3>
              <span className="text-xs text-gray-500 mr-3 w-12 text-center">
                팀원
              </span>
            </div> */}

            <div className="bg-white rounded-2xl">
              {data?.data?.teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <SkeletonContent />
      )}
    </div>
  );
};

type TeamCardProps = {
  team: Team & {
    _count: {
      members: number;
    };
    stats?: {
      professionalCount: number;
    };
  };
  isMyTeam?: boolean;
};

const TeamCard = ({ team }: TeamCardProps) => {
  const router = useRouter();

  return (
    <div
      className="border-t border-gray-100 first:border-t-0 px-3 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => router.push(`/teams/${team.id}`)}
    >
      <div className="flex gap-3">
        {/* 팀 로고 */}
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 relative">
          {team.logoUrl ? (
            <Image src={team.logoUrl} alt={team.name} width={48} height={48} />
          ) : (
            <div className="size-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 relative">
              {team.name.charAt(0)}
            </div>
          )}
          {/* {team.isRecruiting && (
            <span className="absolute -top-2 -left-2 px-2 py-1 text-xs font-semibold bg-gradient-to-br from-emerald-100 to-green-100 text-green-800 rounded-2xl flex-shrink-0 shadow-sm">
              모집중
            </span>
          )} */}
        </div>

        {/* 팀 정보 */}
        <div className="flex flex-col items-start grow">
          <h3 className="text-lg sm:text-base font-semibold flex items-center gap-1.5 truncate leading-none h-6 mb-0.5">
            {team.name}
          </h3>
          <div className="w-full flex flex-col sm:flex-row sm:justify-between">
            <div className="sm:text-sm font-medium tracking-tight flex items-center gap-2 mb-2 sm:mb-0.5">
              {team.gender === "MALE" ? (
                <Mars className="size-4 text-sky-700" />
              ) : team.gender === "FEMALE" ? (
                <Venus className="size-4 text-pink-700" />
              ) : (
                <Blend className="size-4 text-gray-700" />
              )}
              {`${TEAM_GENDER[team.gender as keyof typeof TEAM_GENDER]} • ${
                team._count.members
              }명`}
              <div className="flex items-center gap-1.5 h-4">
                <Separator orientation="vertical" />
                <span className="text-sm sm:text-xs text-gray-500 font-medium">
                  {`${team.city} ${team.district}`}
                </span>
              </div>
            </div>
            {(team.recruitmentStatus === "RECRUITING" ||
              team.stats?.professionalCount) && (
              <div className="flex items-center gap-1">
                {team.recruitmentStatus === "RECRUITING" ? (
                  <div className="flex items-center gap-0.5 bg-sky-500/10 rounded px-1.5 sm:px-1 h-6 sm:h-5">
                    <span className="text-sm sm:text-xs text-sky-700 font-semibold tracking-tight">
                      팀원 모집
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5 bg-slate-500/10 rounded px-1.5 sm:px-1 h-6 sm:h-5">
                    <span className="text-sm sm:text-xs text-slate-700 font-semibold tracking-tight">
                      팀원 모집마감
                    </span>
                  </div>
                )}
                {team.stats?.professionalCount ? (
                  <div className="flex items-center gap-0.5 bg-indigo-500/10 rounded px-1.5 sm:px-1 h-6 sm:h-5">
                    <span className="text-sm sm:text-xs text-indigo-700 font-medium tracking-tight">
                      {`선출 ${team.stats?.professionalCount}명`}
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* 누적 경기수와 팀원 수 */}
        {/* {!isMyTeam && (
          <div className="text-center flex-shrink-0 w-12 text-lg font-semibold text-gray-900 my-auto">
            {team._count.members ?? 0}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default TeamsPage;
