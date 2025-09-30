"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPlayer, type PlayerData } from "../model/actions";
import { followUser } from "../actions/follow-user"; // 새로 추가한 액션 import
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react"; // useSession import 추가
import Image from "next/image";
import {
  ArrowLeft,
  Cake,
  CalendarCheck2,
  CalendarDays,
  Footprints,
  History,
  Loader2,
  Ruler,
  Shapes,
  Share,
  VenusAndMars,
} from "lucide-react";
import { getCurrentAge } from "@/entities/user/model/actions";
import {
  FOOT,
  FUTSAL_POSITIONS,
  FUTSAL_POSITIONS_KOREAN,
  GENDER,
  PLAYER_BACKGROUND,
  SKILL_LEVEL_OPTIONS,
} from "@/entities/user/model/constants";
import { Label } from "@/shared/components/ui/label";
import TeamList from "@/app/(main-layout)/teams/ui/TeamList";
// import MannerBar from "./MannerBar";
import InjuredBadge from "@/shared/components/ui/InjuredBadge";
// import PlayerPhotosGallery from "./PlayerPhotosGallery";
// import PlayerSchedule from "./PlayerSchedule";
import PlayerRatingRadarChart from "./PlayerRadarChart";
import { ChartBarIcon } from "@phosphor-icons/react";

// 서버 액션에서 가져온 타입을 그대로 사용

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col gap-1 items-center my-2 pb-2">
    <div className="font-semibold">{value}</div>
    <Label className="text-muted-foreground">{label}</Label>
  </div>
);

/**
 * yyyymmdd 형식의 문자열을 "yyyy년 m월 d일"로 변환
 * @param dateStr yyyymmdd 형식 문자열 (예: "19860302")
 * @returns 변환된 날짜 문자열
 */
export function formatKoreanDate(dateStr: string): string {
  if (dateStr.length !== 8) return dateStr;

  const year = dateStr.substring(0, 4);
  const month = parseInt(dateStr.substring(4, 6), 10); // 03 -> 3
  const day = parseInt(dateStr.substring(6, 8), 10); // 02 -> 2

  return `${year}년 ${month}월 ${day}일`;
}

const PlayerContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const session = useSession(); // 세션 추가

  const { data, refetch } = useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayer(id),
    placeholderData: keepPreviousData,
    enabled: !!id,
  });

  console.log(data);

  const handleGoBack = () => {
    router.back();
  };

  // 팔로우 처리 함수 추가
  const handleFollowClick = async (userId: string) => {
    if (!session.data) {
      alert("로그인이 필요합니다.");
      signIn();
      return;
    }

    try {
      const result = await followUser({ userId });
      console.log(result);
      if (result.success) {
        refetch(); // 데이터 재조회하여 UI 업데이트
        // toast.success(result.message); // 토스트 메시지가 있다면 활용
      } else {
        console.warn(result.error);
        alert(result.error);
        // toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  if (!data) {
    return (
      <div className="p-8 text-center min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin mx-auto mb-4" size={48} />
        <p className="text-gray-500">데이터를 불러오는 중...</p>
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

  // 현재 사용자가 이 회원을 팔로우하고 있는지 확인
  const isFollowing = playerData.followers?.some(
    (follow) => follow.followerId === session.data?.user?.id
  );

  // 자기 자신인지 확인
  const isOwnProfile = session.data?.user?.id === id;

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
          {/* 자기 자신이 아닐 때만 팔로우 버튼 표시 */}
          {!isOwnProfile && (
            <button
              type="button"
              className={`shrink-0 h-9 px-4 gap-1.5 flex items-center justify-center rounded-full transition-colors cursor-pointer font-semibold ${
                isFollowing
                  ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                  : "bg-neutral-100 hover:bg-neutral-200 text-gray-600 hover:text-gray-700"
              }`}
              onClick={() => handleFollowClick(id)}
            >
              {isFollowing ? "팔로잉" : "팔로우"}
            </button>
          )}
          <button
            className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            type="button"
            onClick={async () => {
              console.log(process.env.NODE_ENV, "env");
              try {
                if (process.env.NODE_ENV === "development") {
                  console.log("development");
                  await navigator.clipboard.writeText(
                    `localhost:3000/players/${id}`
                  );
                } else {
                  console.log("production");
                  await navigator.clipboard.writeText(
                    `www.futsalgo.com/players/${id}`
                  );
                }
              } catch (error) {
                console.error(error, "error");
              } finally {
                alert("URL이 복사되었습니다.");
              }
            }}
          >
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
                <div className="size-20 flex items-center justify-center shrink-0 overflow-hidden rounded-full border">
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
                <h1 className="text-xl sm:text-lg font-semibold">
                  {playerData.nickname}
                </h1>
                <span className="font-medium text-muted-foreground tracking-tight leading-tight">
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
                    {data?.data?.accounts?.[0]?.provider && (
                      <span className="text-sm tracking-tight">
                        {` • ${data?.data?.accounts?.[0]?.provider}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* <MannerBar /> */}
          </div>
        </div>

        {/* 소속 팀 */}
        {playerData.teams.length > 0 ? (
          <div className="mx-4 border rounded-md overflow-hidden shadow-xs">
            {playerData.teams.map((team) => (
              <TeamList team={team.team} key={team.team.id} size="sm" />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center px-4 py-6 my-3 font-medium text-muted-foreground">
            소속 팀이 존재하지 않습니다
          </div>
        )}

        {/* 기본 정보 & 피치 포지션 */}
        <div className="flex flex-col sm:flex-row gap-3 mx-4 sm:border-b border-gray-100">
          {/* 기본 정보 */}
          <div className="grow">
            {/* 출신 */}
            <div className="w-full flex items-center justify-between px-1 h-12 sm:h-11 border-t border-gray-100 gap-3">
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
            <div className="w-full flex items-center justify-between px-1 h-12 sm:h-11 border-t border-gray-100 gap-3">
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
            <div className="w-full flex items-center justify-between px-1 h-12 sm:h-11 border-t border-gray-100 gap-3">
              <div className="flex items-center space-x-3">
                <Cake className="size-5 text-gray-600" />
                <span className="font-medium">생년월일</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  {formatKoreanDate(playerData.birthDate as string)}
                </span>
              </div>
            </div>
            {/* 나이 */}
            <div className="w-full flex items-center justify-between px-1 h-12 sm:h-11 border-t border-gray-100 gap-3">
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
            <div className="w-full flex items-center justify-between px-1 h-12 sm:h-11 border-t border-gray-100 gap-3">
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
            <div className="w-full flex items-center justify-between px-1 h-12 sm:h-11 border-t border-gray-100 gap-3">
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
            <div className="w-full flex items-center justify-between px-1 h-12 sm:h-11 border-t border-gray-100 gap-3">
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
          <div>
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
              <div className="absolute w-full h-full top-0 left-0 flex">
                <div className="h-full w-1/4 flex items-center justify-center">
                  <div
                    className={`mr-3 size-4 rounded-full ${
                      playerData.position === "GOLEIRO"
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
                      playerData.position === "PIVO"
                        ? "bg-red-500"
                        : "bg-white/50"
                    }`}
                  />
                </div>
                <div className="w-1/5 shrink-0" />
              </div>
            </div>
            {/* 포지션 표시 */}
            <div className="flex justify-center items-center h-12 sm:h-9 bg-gradient-to-b from-green-800/20 to-green-800/5 pb-0.5 border-[3px] border-t-0 sm:border-2 sm:border-y-0 border-white">
              <div className="text-sm sm:text-xs tracking-tight flex items-center gap-1 bg-white rounded px-3 sm:px-1.5 py-1">
                <span className="font-bold text-red-500">
                  {playerData.position}
                </span>
                <span className="text-gray-300">•</span>
                <span className="font-medium text-gray-600">
                  {
                    FUTSAL_POSITIONS_KOREAN[
                      playerData.position as keyof typeof FUTSAL_POSITIONS_KOREAN
                    ]
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 레이더 차트 */}
        <PlayerRatingRadarChart ratingsData={playerData.ratings} />

        <div className="px-4">
          <div className="flex justify-between items-center py-2 min-h-13">
            <div className="flex items-center gap-2">
              <ChartBarIcon weight="fill" className="size-7 text-zinc-500" />
              <h2 className="text-xl font-semibold">통계</h2>
            </div>
            <div className="flex items-center gap-2">2025년</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 자체전 통계 */}
            <div className="overflow-hidden rounded-2xl mb-3">
              <div className="w-full flex items-center justify-between px-4 h-12 gap-3 bg-neutral-50">
                <div className="flex items-center space-x-3">
                  {/* <ChartPie className="size-5 text-gray-600" /> */}
                  <span className="font-medium">자체전</span>
                </div>
                {/* <div className="flex items-center gap-1">
              <span className="text-base font-medium text-gray-500">
                {new Date().getFullYear()}년
              </span>
              <ChevronRight className="size-5 text-gray-400" />
            </div> */}
              </div>
              <div className="bg-gradient-to-b from-neutral-200/70 to-neutral-100 grid grid-cols-4 gap-3 px-4 py-2">
                <StatCard label="경기" value={playerData.stats.squad.matches} />
                <StatCard label="득점" value={playerData.stats.squad.goals} />
                <StatCard label="도움" value={playerData.stats.squad.assists} />
                <StatCard label="MVP" value={playerData.stats.squad.mvp} />
              </div>
            </div>

            {/* 친선전 통계 */}
            <div className="overflow-hidden rounded-2xl mb-3">
              <div className="w-full flex items-center justify-between px-4 h-12 gap-3 bg-neutral-50">
                <div className="flex items-center space-x-3">
                  {/* <ChartPie className="size-5 text-gray-600" /> */}
                  <span className="font-medium">친선전</span>
                </div>
              </div>
              <div className="bg-gradient-to-b from-neutral-200/70 to-neutral-100 grid grid-cols-4 gap-3 px-4 py-2">
                <StatCard label="경기" value={playerData.stats.team.matches} />
                <StatCard label="득점" value={playerData.stats.team.goals} />
                <StatCard label="도움" value={playerData.stats.team.assists} />
                <StatCard label="MVP" value={playerData.stats.team.mvp} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerContent;
