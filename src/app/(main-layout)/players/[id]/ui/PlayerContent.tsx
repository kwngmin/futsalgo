"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPlayer, type PlayerData } from "../model/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Cake,
  CalendarCheck2,
  CalendarDays,
  ChartPie,
  ChevronRight,
  Footprints,
  History,
  Ruler,
  // EllipsisVertical,
  Shapes,
  Share,
  VenusAndMars,
} from "lucide-react";
import { getCurrentAge } from "@/entities/user/model/actions";
import {
  FOOT,
  FUTSAL_POSITIONS,
  GENDER,
  PLAYER_BACKGROUND,
  SKILL_LEVEL_OPTIONS,
} from "@/entities/user/model/constants";
import { Label } from "@/shared/components/ui/label";
import TeamCard from "@/app/(main-layout)/teams/ui/TeamCard";
// import MannerBar from "./MannerBar";
import InjuredBadge from "@/shared/components/ui/InjuredBadge";
// import PlayerPhotosGallery from "./PlayerPhotosGallery";
// import PlayerSchedule from "./PlayerSchedule";
import PlayerRatingRadarChart from "./PlayerRadarChart";

// 서버 액션에서 가져온 타입을 그대로 사용

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col gap-1 items-center my-3">
    <div className="font-semibold">{value}</div>
    <Label className="text-muted-foreground">{label}</Label>
  </div>
);

// const InfoCard = ({
//   label,
//   value,
//   icon: Icon,
// }: {
//   label: string;
//   value: string;
//   icon: React.ComponentType<{ className?: string }>;
// }) => (
//   <div className="border rounded-2xl overflow-hidden mx-4">
//     <div
//       className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-b gap-3 cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors"
//       onClick={() => alert(label)}
//     >
//       <div className="flex items-center space-x-3">
//         <Icon className="size-5 text-gray-600" />
//         <span className="font-medium">{label}</span>
//       </div>
//       <ChevronRight className="size-5 text-gray-400" />
//     </div>
//     <div className="flex flex-col gap-1 items-center font-semibold px-4 py-8">
//       {value}
//     </div>
//   </div>
// );

const PlayerContent = ({ id }: { id: string }) => {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayer(id),
    placeholderData: keepPreviousData,
    enabled: !!id,
  });

  console.log(data);

  const handleGoBack = () => {
    router.back();
  };

  if (!data) {
    return (
      <div className="text-center text-gray-500 pt-10">
        회원 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="text-center text-gray-500 pt-10">
        존재하지 않는 회원입니다.
      </div>
    );
  }

  const playerData = data.data as PlayerData;

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between h-16 shrink-0 px-4 gap-3">
        <button
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          onClick={handleGoBack}
        >
          <ArrowLeft style={{ width: "24px", height: "24px" }} />
        </button>
        <div className="flex justify-end items-center gap-1.5">
          <button
            type="button"
            className="shrink-0 h-9 px-4 gap-1.5 flex items-center justify-center bg-neutral-900 hover:bg-neutral-700 text-white rounded-full transition-colors cursor-pointer font-semibold"
          >
            {/* <UserPlus className="size-5 text-gray-600" /> */}
            팔로우
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Share className="size-5" />
          </button>
          {/* <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <EllipsisVertical className="size-5" />
          </button> */}
        </div>
      </div>

      <div className="space-y-3">
        {/* 회원 정보 */}
        <div className="space-y-2">
          <div className="space-y-4 px-4">
            <div className="flex items-center gap-4 h-20 mb-4">
              {/* 프로필 사진 */}
              <div className="relative">
                <div className="size-20 flex items-center justify-center shrink-0 overflow-hidden rounded-4xl border">
                  <Image
                    width={80}
                    height={80}
                    src={playerData.image || ""}
                    alt="profile_image"
                    className="object-cover scale-105"
                  />
                </div>
                {playerData.condition === "INJURED" && (
                  <InjuredBadge size="lg" />
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold">{playerData.nickname}</h1>
                <span className="font-medium text-muted-foreground tracking-tight leading-tight">
                  {/* {playerData.createdAt
                    ? `${new Date(playerData.createdAt).toLocaleDateString(
                        "ko-KR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )} 가입`
                    : "데이터 없음"} */}
                  {SKILL_LEVEL_OPTIONS.find(
                    (option) => option.value === playerData.skillLevel
                  )?.label || "정보 없음"}
                </span>
                <div className="flex items-center gap-2 mt-2 text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarCheck2 className="size-3.5" />
                    <span className="text-sm tracking-tight">
                      {data?.data?.createdAt
                        ? `${new Date(data?.data?.createdAt).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )} 가입`
                        : "데이터 없음"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* <MannerBar /> */}
          </div>
        </div>

        {/* 소속 팀 */}
        {playerData.teams.length > 0 ? (
          <div className="mx-4 border border-neutral-300 rounded-md overflow-hidden shadow-xs">
            {playerData.teams.map((team) => (
              <TeamCard team={team.team} key={team.team.id} size="sm" />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center px-4 py-6 my-3 font-medium text-muted-foreground">
            소속 팀이 존재하지 않습니다
          </div>
        )}

        {/* 기본 정보 & 피치 포지션 */}
        <div className="flex flex-col sm:flex-row gap-3 px-4">
          {/* 기본 정보 */}
          <div className="grow">
            {/* 출신 */}
            <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3">
              <div className="flex items-center space-x-3">
                <History className="size-5 text-gray-600" />
                <span className="font-medium">출신</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {
                    PLAYER_BACKGROUND[
                      playerData.playerBackground as keyof typeof PLAYER_BACKGROUND
                    ]
                  }
                </span>
              </div>
            </div>
            {/* 성별 */}
            <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3">
              <div className="flex items-center space-x-3">
                <VenusAndMars className="size-5 text-gray-600" />
                <span className="font-medium">성별</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {GENDER[playerData.gender as keyof typeof GENDER]}
                </span>
              </div>
            </div>
            {/* 생년월일 */}
            <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3">
              <div className="flex items-center space-x-3">
                <Cake className="size-5 text-gray-600" />
                <span className="font-medium">생년월일</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {playerData.birthDate?.slice(0, 4)}년{" "}
                  {playerData.birthDate?.slice(4, 6)}월{" "}
                  {playerData.birthDate?.slice(6, 8)}일
                </span>
              </div>
            </div>
            {/* 나이 */}
            <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3">
              <div className="flex items-center space-x-3">
                <CalendarDays className="size-5 text-gray-600" />
                <span className="font-medium">나이</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {getCurrentAge(playerData.birthDate as string).age}살
                </span>
              </div>
            </div>
            {/* 키 */}
            <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3">
              <div className="flex items-center space-x-3">
                <Ruler className="size-5 text-gray-600" />
                <span className="font-medium">키</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {playerData.height}cm
                </span>
              </div>
            </div>
            {/* 사용하는 발 */}
            <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3">
              <div className="flex items-center space-x-3">
                <Footprints className="size-5 text-gray-600" />
                <span className="font-medium">사용하는 발</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {FOOT[playerData.foot as keyof typeof FOOT]}
                </span>
              </div>
            </div>
            {/* 선호하는 포지션 */}
            <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-y border-gray-100 gap-3">
              <div className="flex items-center space-x-3">
                <Shapes className="size-5 text-gray-600" />
                <span className="font-medium">선호하는 포지션</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {
                    FUTSAL_POSITIONS[
                      playerData.position as keyof typeof FUTSAL_POSITIONS
                    ]
                  }
                </span>
              </div>
            </div>
          </div>

          {/* 피치 포지션 */}
          <div className="">
            {/* 데스크탑 */}
            <div className="relative select-none hidden sm:block">
              <div className="w-full h-full flex items-center justify-center ">
                <Image
                  src="/full_pitch_vertical.svg"
                  alt="position"
                  width={135}
                  height={268}
                  className="object-cover"
                />
              </div>
              <div className="absolute w-full h-full top-0 left-0 flex flex-col pt-4">
                <div className="h-1/4 shrink-0" />
                <div className="w-full h-1/4 flex items-center justify-center">
                  <div
                    className={`size-3.5 rounded-full ${
                      playerData.position === "PIVO"
                        ? "bg-red-500"
                        : "bg-white/50"
                    }`}
                  />
                </div>
                <div className="w-full h-1/4 flex justify-between items-center px-4">
                  <div
                    className={`size-3.5 rounded-full ${
                      playerData.position === "ALA"
                        ? "bg-red-500"
                        : "bg-white/50"
                    }`}
                  />
                  <div
                    className={`size-3.5 rounded-full ${
                      playerData.position === "ALA"
                        ? "bg-red-500"
                        : "bg-white/50"
                    }`}
                  />
                </div>
                <div className="w-full h-1/4 flex items-center justify-center">
                  <div
                    className={`size-3.5 rounded-full ${
                      playerData.position === "FIXO"
                        ? "bg-red-500"
                        : "bg-white/50"
                    }`}
                  />
                </div>
                <div className="w-full h-1/4 flex items-center justify-center">
                  <div
                    className={`size-3.5 rounded-full ${
                      playerData.position === "GOLEIRO"
                        ? "bg-red-500"
                        : "bg-white/50"
                    }`}
                  />
                </div>
              </div>
            </div>
            {/* 모바일 */}
            <div className="relative select-none sm:hidden">
              <div className="w-full h-full flex items-center justify-center ">
                <Image
                  src="/full_pitch.svg"
                  alt="position"
                  width={806}
                  height={406}
                  className="object-cover"
                />
              </div>
              <div className="absolute w-full h-full top-0 left-0 flex pl-4">
                <div className="w-1/4 shrink-0" />
                <div className="h-full w-1/4 flex items-center justify-center">
                  <div
                    className={`size-4 rounded-full ${
                      playerData.position === "PIVO"
                        ? "bg-red-500"
                        : "bg-white/50"
                    }`}
                  />
                </div>
                <div className="h-full w-1/4 flex flex-col justify-between items-center py-5 sm:py-4">
                  <div
                    className={`size-4 rounded-full ${
                      playerData.position === "ALA"
                        ? "bg-red-500"
                        : "bg-white/50"
                    }`}
                  />
                  <div
                    className={`size-4 rounded-full ${
                      playerData.position === "ALA"
                        ? "bg-red-500"
                        : "bg-white/50"
                    }`}
                  />
                </div>
                <div className="h-full w-1/4 flex items-center justify-center">
                  <div
                    className={`size-4 rounded-full ${
                      playerData.position === "FIXO"
                        ? "bg-red-500"
                        : "bg-white/50"
                    }`}
                  />
                </div>
                <div className="h-full w-1/4 flex items-center justify-center">
                  <div
                    className={`size-4 rounded-full ${
                      playerData.position === "GOLEIRO"
                        ? "bg-red-500"
                        : "bg-white/50"
                    }`}
                  />
                </div>
              </div>
            </div>
            {/* 포지션 표시 */}
            <div className="flex justify-center items-center px-4 h-12 sm:h-10 text-sm tracking-tight font-semibold bg-neutral-100 text-gray-600 pb-0.5 leading-tight border-[3px] sm:border-2 border-white rounded-md">
              {playerData.position}
            </div>
          </div>
        </div>

        {/* 레이더 차트 */}
        <PlayerRatingRadarChart ratingsData={playerData.ratings} />

        {/* 통계 */}
        <div className="border rounded-2xl overflow-hidden mx-4">
          <div
            className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-b gap-3 cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors"
            onClick={() => alert("통계")}
          >
            <div className="flex items-center space-x-3">
              <ChartPie className="size-5 text-gray-600" />
              <span className="font-medium">통계</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-gray-500">
                {new Date().getFullYear()}년
              </span>
              <ChevronRight className="size-5 text-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 px-4 py-2 mb-2">
            <StatCard label="경기" value={playerData.stats.matches} />
            <StatCard label="득점" value={playerData.stats.goals} />
            <StatCard label="어시스트" value={playerData.stats.assists} />
            <StatCard label="MVP" value={playerData.stats.mvp} />
          </div>
        </div>

        {/* {selectedTab === "photos" && <PlayerPhotosGallery userId={id} />}

        {selectedTab === "matches" && <PlayerSchedule userId={id} />} */}
      </div>
    </div>
  );
};

export default PlayerContent;
