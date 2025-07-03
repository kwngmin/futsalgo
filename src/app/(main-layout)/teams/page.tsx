"use client";

import {
  Search, //
  ArrowDownUp,
} from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTeams, GetTeamsResponse } from "./model/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SkeletonContent from "./ui/SkeletonTeamContent";
import TeamCard from "./ui/TeamCard";
// import { Separator } from "@/shared/components/ui/separator";

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
          {isLoggedIn ? (
            data?.data?.myTeams && data?.data?.myTeams.length > 0 ? (
              <div className="space-y-3">
                {data?.data?.myTeams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white rounded-2xl ring ring-slate-400"
                  >
                    <TeamCard team={team} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-200 rounded-2xl p-4">
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
          ) : null}

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

export default TeamsPage;
