"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPlayer, type PlayerData } from "../model/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarCheck2,
  ChartPie,
  ChevronRight,
  // EllipsisVertical,
  Shapes,
  Share,
} from "lucide-react";
import { getCurrentAge } from "@/entities/user/model/actions";
import {
  CONDITION,
  FOOT,
  FUTSAL_POSITIONS,
  GENDER,
  PLAYER_BACKGROUND,
  SKILL_LEVEL_OPTIONS,
} from "@/entities/user/model/constants";
import { Label } from "@/shared/components/ui/label";
import TeamCard from "@/app/(main-layout)/teams/ui/TeamCard";
// import MannerBar from "./MannerBar";
import { Fragment, useState } from "react";
import InjuredBadge from "@/shared/components/ui/InjuredBadge";
import PlayerPhotosGallery from "./PlayerPhotosGallery";
import PlayerSchedule from "./PlayerSchedule";
import PlayerRatingRadarChart from "./PlayerRadarChart";

// 서버 액션에서 가져온 타입을 그대로 사용

const tabs = [
  {
    label: "프로필",
    value: "overview",
    isDisabled: false,
  },
  {
    label: "소속 팀",
    value: "teams",
    isDisabled: false,
  },
  {
    label: "경기일정",
    value: "matches",
    isDisabled: false,
  },
  {
    label: "사진",
    value: "photos",
    isDisabled: false,
  },
];

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
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].value);

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
        <div className="flex justify-end items-center gap-2">
          <button
            type="button"
            className="shrink-0 h-9 px-4 gap-1.5 flex items-center justify-center bg-neutral-100 hover:bg-neurtral-200 rounded-full transition-colors cursor-pointer font-semibold"
          >
            {/* <UserPlus className="size-5 text-gray-600" /> */}
            팔로우
          </button>
          <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Share className="size-5" />
          </button>
          {/* <button className="shrink-0 size-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <EllipsisVertical className="size-5" />
          </button> */}
        </div>
      </div>

      <div className="space-y-3">
        {/* 회원 정보 */}
        <div className="border-b border-gray-300 space-y-2">
          <div className="space-y-4 px-4">
            <div className="flex items-center gap-4 h-20 mb-8">
              {/* 프로필 사진 */}
              <div className="relative">
                <div className="size-20 flex items-center justify-center shrink-0 overflow-hidden rounded-4xl">
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
                <span className="font-medium text-muted-foreground tracking-tight">
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
              </div>
            </div>
            {/* <MannerBar /> */}
          </div>

          {/* 탭 */}
          <div className="flex items-center justify-between gap-2 px-4">
            <div className="flex h-12 space-x-2">
              {tabs.map((tab) => (
                <div
                  key={tab.value}
                  className={`flex justify-center items-center min-w-14 font-semibold text-base px-2 cursor-pointer border-b-4 ${
                    selectedTab === tab.value
                      ? "border-gray-700"
                      : "border-transparent"
                  } ${tab.isDisabled ? "pointer-events-none opacity-50" : ""}`}
                  onClick={() => setSelectedTab(tab.value)}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 소속 팀 */}
        {selectedTab === "teams" &&
          (playerData.teams.length > 0 ? (
            playerData.teams.map((team) => (
              <TeamCard team={team.team} key={team.team.id} />
            ))
          ) : (
            <div className="flex flex-col gap-1 items-center px-4 py-6 my-3 font-medium text-muted-foreground">
              소속 팀이 존재하지 않습니다
            </div>
          ))}

        {selectedTab === "overview" && (
          <Fragment>
            {/* 기본 정보 */}
            <div className="bg-neutral-50 rounded-2xl mx-4 grid grid-cols-3 sm:grid-cols-6 gap-3 p-4">
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">
                  {GENDER[playerData.gender as keyof typeof GENDER]}
                </div>
                <Label className="text-muted-foreground">성별</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">
                  {
                    PLAYER_BACKGROUND[
                      playerData.playerBackground as keyof typeof PLAYER_BACKGROUND
                    ]
                  }
                </div>
                <Label className="text-muted-foreground">출신</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">
                  {getCurrentAge(playerData.birthDate as string).age}살
                </div>
                <Label className="text-muted-foreground">나이</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">{playerData.height}cm</div>
                <Label className="text-muted-foreground">키</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">
                  {FOOT[playerData.foot as keyof typeof FOOT]}
                </div>
                <Label className="text-muted-foreground">사용하는 발</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">
                  {CONDITION[playerData.condition as keyof typeof CONDITION]}
                </div>
                <Label className="text-muted-foreground">부상</Label>
              </div>
            </div>

            {/* 선호 포지션 */}
            <div className="grid grid-cols-2 mx-4 gap-2">
              <div className="border rounded-2xl overflow-hidden flex flex-col">
                <div
                  className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-b gap-3 cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  onClick={() => alert("선호 포지션")}
                >
                  <div className="flex items-center space-x-3">
                    <Shapes className="size-5 text-gray-600" />
                    <span className="font-medium">선호 포지션</span>
                  </div>
                </div>
                <div className="h-full min-h-20 grow flex flex-col gap-1 items-center justify-center">
                  <div className="font-semibold">
                    {
                      FUTSAL_POSITIONS[
                        playerData.position as keyof typeof FUTSAL_POSITIONS
                      ]
                    }
                  </div>
                  <Label className="text-muted-foreground">
                    {playerData.position}
                  </Label>
                </div>
              </div>

              {/* 피치 포지션 */}
              <div className="flex items-center justify-center">
                <div className="h-fit relative select-none">
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
                    <div className="h-full w-1/4 flex flex-col justify-between items-center py-3 sm:py-4">
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

            <div>
              {/* 가입일 */}
              <div className="w-full flex items-center justify-between px-4 h-12 sm:h-11 border-t border-gray-100 gap-3">
                <div className="flex items-center space-x-2">
                  <CalendarCheck2 className="size-5 text-gray-600" />
                  <span className="font-medium">가입일</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-base font-medium text-gray-500">
                    {data?.data?.createdAt
                      ? new Date(data?.data?.createdAt).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "데이터 없음"}
                  </span>
                </div>
              </div>
            </div>
          </Fragment>
        )}

        {selectedTab === "photos" && <PlayerPhotosGallery userId={id} />}

        {selectedTab === "matches" && <PlayerSchedule userId={id} />}
      </div>
    </div>
  );
};

export default PlayerContent;
