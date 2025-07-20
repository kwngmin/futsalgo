"use client";

import {
  Search, //
  ArrowDownUp,
  Plus,
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

  console.log(data?.data?.myTeams, "data?.data?.myTeams");

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex gap-3">
          <h1 className="text-2xl font-bold">팀</h1>
          <h1 className="text-2xl font-bold opacity-30">팔로잉</h1>
        </div>
        <div className="flex items-center gap-2">
          {Array.isArray(data?.data?.myTeams) &&
            data?.data?.myTeams.length < 6 && (
              <button
                type="button"
                onClick={() => router.push(isLoggedIn ? "/teams/create" : "/")} // 로그인 안되어있으면 로그인 페이지로 이동
                className="shrink-0 h-10 pl-3 pr-4 gap-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer font-semibold"
              >
                <Plus className="w-5 h-5" strokeWidth={2} />팀 등록
              </button>
            )}
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Search className="w-5 h-5" />
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <ArrowDownUp className="w-5 h-5" />
          </button>
        </div>
      </div>
      {data ? (
        <div className="space-y-3">
          {/* 필터 섹션 */}
          {/* <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 justify-between hidden">
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
            </div>
          </div> */}

          {/* 팀 목록 */}
          <div className="bg-white rounded-2xl">
            {data?.data?.teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </div>
      ) : (
        <SkeletonContent />
      )}
    </div>
  );
};

export default TeamsPage;
