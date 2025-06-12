"use client";

import { useState } from "react";
import { Search, ArrowDownUp } from "lucide-react";
import Image from "next/image";

// 샘플 선수 데이터
const players = [
  {
    id: 1,
    nickname: "축구왕김철수",
    teamName: "FC 서울",
    gender: "male",
    image: null, // 프로필 이미지 URL
    totalMatches: 42,
    isFollowing: false,
  },
  {
    id: 2,
    nickname: "골잡이이영희",
    teamName: "서울 위민스 FC",
    gender: "female",
    image: null,
    totalMatches: 28,
    isFollowing: true,
  },
  {
    id: 3,
    nickname: "패스마스터",
    teamName: "한강 FC",
    gender: "male",
    image: null,
    totalMatches: 35,
    isFollowing: false,
  },
  {
    id: 4,
    nickname: "수비벽박민수",
    teamName: "강북 유나이티드",
    gender: "male",
    image: null,
    totalMatches: 51,
    isFollowing: true,
  },
  {
    id: 5,
    nickname: "윙어지우",
    teamName: "강남 레이디스",
    gender: "female",
    image: null,
    totalMatches: 19,
    isFollowing: false,
  },
  {
    id: 6,
    nickname: "골키퍼최강",
    teamName: "수원 FC",
    gender: "male",
    image: null,
    totalMatches: 38,
    isFollowing: false,
  },
  {
    id: 7,
    nickname: "드리블러김나나",
    teamName: null, // 무소속
    gender: "female",
    image: null,
    totalMatches: 15,
    isFollowing: false,
  },
];

// 현재 사용자 정보 (로그인 상태에 따라)
const currentUser = {
  id: 99,
  nickname: "내닉네임",
  teamName: "FC 서울",
  gender: "male",
  image: null,
  totalMatches: 24,
  isFollowing: false,
};

// 로그인 상태 시뮬레이션
const isLoggedIn = true; // false로 변경하면 로그인 안한 상태

type FilterType = "all" | "male" | "female" | "following";

const PlayersPage = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  // 필터에 따라 선수 목록 필터링
  const filteredPlayers = players.filter((player) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "following") return player.isFollowing;
    return player.gender === selectedFilter;
  });

  // 필터 옵션들
  const filterOptions = [
    { id: "all", label: "전체" },
    { id: "male", label: "남성" },
    { id: "female", label: "여성" },
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

      <div className="px-3 space-y-4">
        {/* 내 프로필 섹션 또는 로그인 안내 */}
        <div>
          {isLoggedIn ? (
            <div className="space-y-3">
              <PlayerCard player={currentUser} isCurrentUser={true} />
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-100 rounded-2xl p-4">
              <h3 className="font-medium text-gray-900">로그인이 필요합니다</h3>
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
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>

        {/* 선수가 없는 경우 */}
        {filteredPlayers.length === 0 && (
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
    </div>
  );
};

// 선수 카드 컴포넌트
type Player = {
  id: number;
  nickname: string;
  teamName: string | null;
  gender: string;
  image: string | null;
  totalMatches: number;
  isFollowing: boolean;
};

type PlayerCardProps = {
  player: Player;
  isCurrentUser?: boolean;
};

const PlayerCard = ({ player, isCurrentUser = false }: PlayerCardProps) => {
  return (
    <div
      className={`bg-white rounded-2xl p-3 hover:shadow-sm/5 transition-shadow cursor-pointer ${
        isCurrentUser ? "ring-2 ring-accent" : ""
      }`}
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
                alt={player.nickname}
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
            <span
              className={`size-5 flex items-center justify-center text-xs font-semibold rounded flex-shrink-0 ${
                player.gender === "male"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-pink-50 text-pink-600"
              }`}
            >
              {player.gender === "male" ? "M" : "F"}
            </span>
            {/* 팔로잉 표시 (현재 사용자가 아닐 때만) */}
            {!isCurrentUser && player.isFollowing && (
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-800 rounded-full flex-shrink-0 outline outline-slate-200">
                팔로잉
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm line-clamp-1">
            {player.teamName || "무소속"}
          </p>
        </div>

        {/* 참가 경기수 */}
        <div className="text-center flex-shrink-0 w-12">
          <div className="text-xs text-gray-500 mb-1">경기</div>
          <div className="text-lg font-semibold text-gray-900">
            {player.totalMatches}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayersPage;
