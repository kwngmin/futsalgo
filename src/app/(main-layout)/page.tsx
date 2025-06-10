"use client";

import { useState } from "react";
import { Search, ArrowDownUp } from "lucide-react";

// 샘플 팀 데이터
const teams = [
  {
    id: 1,
    name: "FC 서울",
    description: "매주 토요일 오후 2시, 강남구 축구장",
    memberCount: 12,
    city: "서울시",
    district: "강남구",
    isJoined: true,
    gender: "male",
    isRecruiting: true,
    logo: "⚽",
    totalMatches: 24,
  },
  {
    id: 2,
    name: "한강 FC",
    description: "일요일 아침 풋살, 초보자 환영",
    memberCount: 8,
    city: "서울시",
    district: "마포구",
    isJoined: false,
    gender: "male",
    isRecruiting: false,
    logo: "🔥",
    totalMatches: 18,
  },
  {
    id: 3,
    name: "강북 유나이티드",
    description: "주말 저녁 경기, 실력자들만",
    memberCount: 16,
    city: "서울시",
    district: "강북구",
    isJoined: false,
    gender: "male",
    isRecruiting: true,
    logo: "🏆",
    totalMatches: 32,
  },
  {
    id: 4,
    name: "서울 위민스 FC",
    description: "여성 축구팀, 매주 일요일 모임",
    memberCount: 10,
    city: "서울시",
    district: "영등포구",
    isJoined: false,
    gender: "female",
    isRecruiting: false,
    logo: "💜",
    totalMatches: 15,
  },
  {
    id: 5,
    name: "강남 레이디스",
    description: "강남 지역 여성 풋살팀",
    memberCount: 14,
    city: "서울시",
    district: "강남구",
    isJoined: false,
    gender: "female",
    isRecruiting: true,
    logo: "🌟",
    totalMatches: 28,
  },
  {
    id: 6,
    name: "수원 FC",
    description: "경기도 수원 지역 남성팀",
    memberCount: 20,
    city: "경기도",
    district: "수원시",
    isJoined: false,
    gender: "male",
    isRecruiting: true,
    logo: "⭐",
    totalMatches: 42,
  },
];

type FilterType = "all" | "male" | "female";

const MainPage = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  // 필터에 따라 팀 목록 필터링
  const filteredTeams = teams.filter((team) => {
    if (selectedFilter === "all") return true;
    return team.gender === selectedFilter;
  });

  // 내 팀과 다른 팀 분리
  const myTeams = teams.filter((team) => team.isJoined);
  const otherTeams = filteredTeams.filter((team) => !team.isJoined);

  // 필터 옵션들
  const filterOptions = [
    { id: "all", label: "전체" },
    { id: "male", label: "남성" },
    { id: "female", label: "여성" },
  ];

  return (
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-6 h-16 shrink-0">
        <h1 className="text-2xl font-bold">팀</h1>
        <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-colors cursor-pointer">
          <Search className="w-5 h-5" />
        </button>
      </div>
      <div className="px-3 space-y-4">
        <div>
          {/* 내 팀 섹션 */}
          {myTeams.length > 0 ? (
            <div className="space-y-3">
              {myTeams.map((team) => (
                <TeamCard key={team.id} team={team} isMyTeam />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-100 rounded-2xl p-4">
              {/* 팀이 없는 경우 */}
              {/* <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" /> */}
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
        </div>
        {/* 다른 팀 섹션 */}
        <div className="flex flex-col gap-2">
          {/* 하단: 필터 칩들 */}
          <div className="flex items-center gap-2 justify-between">
            {/* <span className="text-sm font-semibold text-gray-600 mr-1">
              구분
            </span> */}
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedFilter(option.id as FilterType)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                    selectedFilter === option.id
                      ? "bg-black text-white font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                    //   : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
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

          <div className="space-y-3">
            {otherTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 팀 카드 컴포넌트
type Team = {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  city: string;
  district: string;
  isJoined: boolean;
  gender: string;
  isRecruiting: boolean;
  logo: string;
  totalMatches: number;
};

type TeamCardProps = {
  team: Team;
  isMyTeam?: boolean;
};

const TeamCard = ({ team, isMyTeam: isMyTeam = false }: TeamCardProps) => {
  return (
    <div
      className={`bg-white rounded-2xl p-3 hover:shadow-md/5 transition-shadow cursor-pointer ${
        isMyTeam ? "ring-2 ring-accent" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 팀 로고 */}
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 relative">
          {team.logo}
          {team.isRecruiting && (
            <span className="absolute -top-2 -left-2 px-2 py-1 text-xs font-semibold bg-gradient-to-br from-emerald-100 to-green-100 text-green-800 rounded-2xl flex-shrink-0 shadow-sm">
              모집중
            </span>
          )}
        </div>

        {/* 팀 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base truncate mb-0.5">
              {team.name}
            </h3>
            {/* 남성팀, 여성팀 구분 */}
            <span
              className={`size-5 flex items-center justify-center text-xs font-semibold rounded flex-shrink-0 ${
                team.gender === "male"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-pink-50 text-pink-600"
              }`}
            >
              {team.gender === "male" ? "M" : "F"}
            </span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-1 ">
            {team.description}
          </p>
        </div>

        {/* 누적 경기수와 팀원 수 */}
        <div className="text-center flex-shrink-0 flex items-center gap-2">
          <div className="w-12">
            <div className="text-xs text-gray-500 mb-1">팀원</div>
            <div className="text-lg font-semibold text-gray-900">
              {team.memberCount}
            </div>
          </div>
          {/* <span className="text-gray-300">|</span>
          <div className="w-12">
            <div className="text-xs text-gray-500 mb-1">경기</div>
            <div className="text-lg font-semibold text-gray-900">
              {team.totalMatches}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
