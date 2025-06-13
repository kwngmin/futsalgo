"use client";

import { useState } from "react";
import { Search, ArrowDownUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { getPlayers } from "./model/actions";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import PlayerCard from "./ui/PayerCard";
import { User } from "@prisma/client";
import SkeletonPlayCard from "./ui/SkeletonPlayCard";

// // 샘플 선수 데이터
// const players = [
//   {
//     id: 1,
//     nickname: "축구왕김철수",
//     teamName: "FC 서울",
//     gender: "male",
//     image: null, // 프로필 이미지 URL
//     totalMatches: 42,
//     isFollowing: false,
//   },
//   {
//     id: 2,
//     nickname: "골잡이이영희",
//     teamName: "서울 위민스 FC",
//     gender: "female",
//     image: null,
//     totalMatches: 28,
//     isFollowing: true,
//   },
//   {
//     id: 3,
//     nickname: "패스마스터",
//     teamName: "한강 FC",
//     gender: "male",
//     image: null,
//     totalMatches: 35,
//     isFollowing: false,
//   },
//   {
//     id: 4,
//     nickname: "수비벽박민수",
//     teamName: "강북 유나이티드",
//     gender: "male",
//     image: null,
//     totalMatches: 51,
//     isFollowing: true,
//   },
//   {
//     id: 5,
//     nickname: "윙어지우",
//     teamName: "강남 레이디스",
//     gender: "female",
//     image: null,
//     totalMatches: 19,
//     isFollowing: false,
//   },
//   {
//     id: 6,
//     nickname: "골키퍼최강",
//     teamName: "수원 FC",
//     gender: "male",
//     image: null,
//     totalMatches: 38,
//     isFollowing: false,
//   },
//   {
//     id: 7,
//     nickname: "드리블러김나나",
//     teamName: null, // 무소속
//     gender: "female",
//     image: null,
//     totalMatches: 15,
//     isFollowing: false,
//   },
// ];

// // 현재 사용자 정보 (로그인 상태에 따라)
// const currentUser = {
//   id: 99,
//   nickname: "내닉네임",
//   teamName: "FC 서울",
//   gender: "male",
//   image: null,
//   totalMatches: 24,
//   isFollowing: false,
// };

// 로그인 상태 시뮬레이션
// const isLoggedIn = true; // false로 변경하면 로그인 안한 상태

type FilterType = "all" | "MALE" | "FEMALE" | "following";

const PlayersPage = () => {
  const session = useSession();
  const isLoggedIn = session.status === "authenticated";
  console.log(session, "session");

  const { data, isLoading, error } = useQuery({
    queryKey: ["players"],
    queryFn: getPlayers,
    placeholderData: keepPreviousData,
  });

  console.log(data, "data");
  // console.log(user, "user");
  // console.log(players, "players");
  console.log(isLoading, "isLoading");
  console.log(error, "error");

  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  // 필터에 따라 선수 목록 필터링
  const filteredPlayers = data?.data?.players?.filter((player: User) => {
    if (selectedFilter === "all") return true;
    // if (selectedFilter === "following") return player.isFollowing;
    return player.gender === selectedFilter;
  });

  console.log(filteredPlayers, "filteredPlayers");

  // 필터 옵션들
  const filterOptions = [
    { id: "all", label: "전체" },
    { id: "MALE", label: "남성" },
    { id: "FEMALE", label: "여성" },
    { id: "following", label: "팔로잉" },
  ];

  return (
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-6 h-16 shrink-0">
        <h1 className="text-2xl font-bold">선수</h1>
        <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-colors cursor-pointer">
          <Search className="w-5 h-5" />
        </button>
      </div>
      {data ? (
        <div className="px-3 space-y-4">
          {/* 내 프로필 섹션 또는 로그인 안내 */}
          <div>
            {isLoggedIn && data?.data?.user ? (
              <div className="space-y-3">
                <PlayerCard player={data?.data?.user} isCurrentUser={true} />
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-100 rounded-2xl p-4">
                <h3 className="font-medium text-gray-900">
                  로그인이 필요합니다
                </h3>
                <p className="text-gray-500 text-sm">
                  로그인하시면 내 프로필과 경기 기록을 확인할 수 있습니다.
                </p>
                <div className="flex gap-2 justify-center mt-3">
                  <button className="text-sm bg-black text-white px-4 min-w-28 py-1.5 rounded-full font-bold cursor-pointer">
                    로그인
                  </button>
                  <button className="text-sm bg-white text-black px-4 min-w-28 py-1.5 rounded-full cursor-pointer">
                    회원가입
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 필터 섹션 */}
          <div className="flex flex-col gap-2">
            {/* 필터 칩들 */}
            <div className="flex items-center gap-2 justify-between">
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
              <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-colors cursor-pointer bg-gray-100 mr-3">
                <ArrowDownUp className="w-5 h-5" />
              </button>
            </div>

            {/* 선수 목록 */}
            <div className="space-y-3">
              {filteredPlayers?.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>

          {/* 선수가 없는 경우 */}
          {filteredPlayers?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedFilter === "all"
                  ? "선수가 없습니다"
                  : selectedFilter === "following"
                  ? "팔로잉한 선수가 없습니다"
                  : `${
                      filterOptions.find((f) => f.id === selectedFilter)?.label
                    } 선수가 없습니다`}
              </h3>
              <p className="text-gray-500 mb-6">다른 필터를 선택해보세요</p>
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 space-y-4">
          <SkeletonPlayCard nickName="w-32" teamName="w-24" />
          <div className="flex flex-col gap-2">
            <SkeletonPlayCard nickName="w-12" teamName="w-40" />
            <SkeletonPlayCard />
            <SkeletonPlayCard nickName="w-36" teamName="w-12" />
            <SkeletonPlayCard />
            <SkeletonPlayCard nickName="w-28" teamName="w-20" />
            <SkeletonPlayCard nickName="w-40" teamName="w-32" />
            <SkeletonPlayCard />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersPage;
