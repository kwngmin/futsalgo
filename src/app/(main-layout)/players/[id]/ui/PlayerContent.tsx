"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlayer } from "../model/actions";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ChartPie,
  ChevronRight,
  EllipsisVertical,
  Share,
  Sparkles,
} from "lucide-react";
import {
  getCurrentAge, //
} from "@/entities/user/model/actions";
import {
  CONDITION,
  FOOT,
  FUTSAL_POSITIONS,
  GENDER,
  PLAYER_BACKGROUND,
  SKILL_LEVEL_OPTIONS,
} from "@/entities/user/model/constants";
import { Label } from "@/shared/components/ui/label";
import { useSession } from "next-auth/react";
import TeamCard from "@/app/(main-layout)/teams/ui/TeamCard";
import MannerBar from "./MannerBar";
import { useState } from "react";

const tabs = [
  {
    label: "요약",
    value: "overview",
    isDisabled: false,
  },
  {
    label: "경기",
    value: "matches",
    isDisabled: true,
  },
  // {
  //   label: "후기",
  //   value: "reviews",
  //   isDisabled: true,
  // },
];

const PlayerContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const session = useSession();

  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].value);

  const { data } = useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayer(id),
    enabled: !!id, // id 없으면 fetch 안 함
  });
  console.log(data, "player");

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

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between h-16 shrink-0 px-3 gap-3">
        <button
          className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
          onClick={handleGoBack}
        >
          <ArrowLeft style={{ width: "24px", height: "24px" }} />
        </button>
        <div className="flex justify-end gap-3">
          {id !== session.data?.user.id && (
            <div className="flex items-center gap-2">
              <Button
                // size="sm"
                className="rounded-full font-semibold py-0 px-4 text-base h-8"
                // variant="outline"
              >
                팔로우
              </Button>
            </div>
          )}
          <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
            <Share className="w-5 h-5" />
          </button>
          <button className="shrink-0 size-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer">
            <EllipsisVertical className="size-5" />
          </button>
        </div>
      </div>
      {data ? (
        <div className="px-3 space-y-3">
          <div className="bg-white rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-2 px-6 pt-6">
              {/* 프로필 사진 */}
              <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image
                  width={64}
                  height={64}
                  src={data?.data?.image ?? ""}
                  alt="profile_image"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <h1 className="text-xl font-semibold">
                  {data?.data?.nickname}
                </h1>
                <span className="text-sm text-muted-foreground tracking-tight">
                  {data?.data?.createdAt
                    ? `시작일: ${new Date(
                        data?.data?.createdAt
                      ).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}`
                    : "데이터 없음"}
                </span>
                {/* {data.data.teams && data.data.teams.length > 0 ? (
                  <button
                    onClick={() =>
                      router.push(`/teams/${data.data.teams[0].team.id}`)
                    }
                    className="w-full flex items-center justify-between gap-1.5 cursor-pointer"
                  >
                    <Image
                      width={24}
                      height={24}
                      src={
                        logoOptions[
                          Math.floor(Math.random() * logoOptions.length)
                        ]
                      }
                      alt="profile_image"
                      className="size-6 object-cover rounded-md overflow-hidden"
                      unoptimized
                    />
                    <span className="font-medium shrink-0 text-sm">
                      {data.data.teams[0].team.name || "팀 이름 없음"}
                      <span className="font-normal">
                        {" "}
                        •{" "}
                        {
                          TEAM_GENDER[
                            data.data.teams[0].team
                              .gender as keyof typeof TEAM_GENDER
                          ]
                        }
                      </span>
                    </span>
                  </button>
                ) : (
                  <span className="font-medium shrink-0 text-muted-foreground text-sm">
                    소속 팀 없음
                  </span>
                )} */}
              </div>
            </div>
            <MannerBar score={Math.floor(Math.random() * 100)} />
            {data?.data?.teams[0]?.team ? (
              <TeamCard team={data?.data?.teams[0]?.team} />
            ) : (
              <div className="flex items-center gap-2 p-3 h-20 border-t border-gray-100">
                <div className="size-14 flex items-center justify-center">
                  <div className="size-10 bg-gradient-to-br from-slate-300 to-gray-100 rounded-full " />
                </div>
                <span className="sm:text-sm text-muted-foreground font-medium">
                  소속 팀 없음
                </span>
              </div>
            )}
            {/* 탭 */}
            <div className="flex items-center justify-between gap-2 px-3 border-t border-gray-100">
              <div className="flex h-12 space-x-2">
                {tabs
                  // .filter(
                  //   (tab) =>
                  //     tab.value !== "management" ||
                  //     (tab.value === "management" &&
                  //       (data.data.currentUserMembership.role === "MANAGER" ||
                  //         data.data.currentUserMembership.role === "OWNER") &&
                  //       data.data.currentUserMembership.status === "APPROVED")
                  // )
                  .map((tab) => (
                    <div
                      key={tab.value}
                      className={`flex justify-center items-center min-w-14 font-semibold text-base px-2 cursor-pointer border-b-2 ${
                        selectedTab === tab.value
                          ? "border-gray-500"
                          : "border-transparent"
                      } ${
                        tab.isDisabled ? "pointer-events-none opacity-50" : ""
                      }`}
                      onClick={() => setSelectedTab(tab.value)}
                    >
                      {tab.label}
                      {/* <div className={` rounded-t-full h-0.5 w-full flex overflow-hidden ${selectedTab === tab.value ? "":""}`} /> */}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 소속 팀 */}
          {/* {data?.data?.teams[0]?.team ? (
            <div className="bg-white rounded-2xl overflow-hidden">
              <TeamCard team={data?.data?.teams[0]?.team} />
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-white/50 rounded-2xl h-20">
              <div className="size-10 bg-gradient-to-br from-slate-300 to-gray-100 rounded-full " />
              <span className="sm:text-sm text-muted-foreground font-medium">
                소속 팀 없음
              </span>
            </div>
          )} */}
          {/* {data.data.teams && data.data.teams.length > 0 ? (
            <div className="bg-white rounded-2xl">
              <button
                onClick={() =>
                  router.push(`/teams/${data.data.teams[0].team.id}`)
                }
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Image
                    width={24}
                    height={24}
                    src={
                      logoOptions[
                        Math.floor(Math.random() * logoOptions.length)
                      ]
                    }
                    alt="profile_image"
                    className="size-6 object-cover rounded-md overflow-hidden"
                    unoptimized
                  />
                  <span className="font-medium shrink-0">
                    {data.data.teams[0].team.name || "팀 이름 없음"}
                  </span>
                </div>
                <ChevronRight className="size-5 text-gray-400" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden opacity-50 pointer-events-none">
              <button
                onClick={() => alert("플레이 정보 통계")}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <div className="size-6 bg-gray-200 rounded-full" />
                  <span className="font-medium">소속 팀 없음</span>
                </div>
                <ChevronRight className="size-5 text-gray-400" />
              </button>
            </div>
          )} */}

          {/* 성별 및 이름 */}
          {/* <div className="bg-white rounded-lg overflow-hidden">
            <button
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <User2 className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">{`${
                  data?.data?.gender
                    ? `${GENDER[data?.data?.gender as keyof typeof GENDER]}`
                    : "성별 미설정"
                } • ${
                  data?.data?.name
                    ? id === session.data?.user.id
                      ? data?.data?.name
                      : maskName(data?.data?.name)
                    : "이름 없음"
                }`}</span>
              </div>
            </button>
          </div> */}

          {/* 기본 정보 */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl">
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">
                {GENDER[data?.data?.gender as keyof typeof GENDER]}
              </div>
              <Label className="text-muted-foreground">성별</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">
                {
                  PLAYER_BACKGROUND[
                    data?.data
                      ?.playerBackground as keyof typeof PLAYER_BACKGROUND
                  ]
                }
              </div>
              <Label className="text-muted-foreground">출신</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">
                {CONDITION[data?.data?.condition as keyof typeof CONDITION]}
              </div>
              <Label className="text-muted-foreground">몸 상태</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">
                {FOOT[data?.data?.foot as keyof typeof FOOT]}
              </div>
              <Label className="text-muted-foreground">사용하는 발</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">
                {getCurrentAge(data?.data?.birthDate as string).age}살
              </div>
              <Label className="text-muted-foreground">나이</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">{data?.data?.height}cm</div>
              <Label className="text-muted-foreground">키</Label>
            </div>
          </div>

          {/* 선호 포지션 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 bg-white rounded-2xl p-3 gap-3">
            <div className="sm:col-span-2 flex flex-col gap-1 items-center justify-center my-3">
              <div className="font-semibold">
                {
                  FUTSAL_POSITIONS[
                    data?.data?.position as keyof typeof FUTSAL_POSITIONS
                  ]
                }
              </div>
              <Label className="text-muted-foreground">선호 포지션</Label>
            </div>
            <div className="relative">
              <Image
                src="/half_pitch.svg"
                alt="position"
                width={306}
                height={306}
                className="rounded-lg overflow-hidden"
              />
              <div className="absolute w-full h-full top-0 left-0 flex flex-col py-2">
                <div className="w-full h-1/4 flex items-start justify-center">
                  <div
                    className={`px-3 h-7 rounded-full flex items-center justify-center font-semibold text-sm ${
                      data.data.position === "PIVO"
                        ? "bg-white shadow-md"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    PIVO
                  </div>
                </div>
                <div className="w-full h-1/4 flex justify-between items-start px-3">
                  <div
                    className={`px-3 h-7 rounded-full flex items-center justify-center font-semibold text-sm ${
                      data.data.position === "ALA"
                        ? "bg-white shadow-md"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    ALA
                  </div>
                  <div
                    className={`px-3 h-7 rounded-full flex items-center justify-center font-semibold text-sm ${
                      data.data.position === "ALA"
                        ? "bg-white shadow-md"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    ALA
                  </div>
                </div>
                <div className="w-full h-1/4 flex items-start justify-center">
                  <div
                    className={`px-3 h-7 rounded-full flex items-center justify-center font-semibold text-sm ${
                      data.data.position === "FIXO"
                        ? "bg-white shadow-md"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    FIXO
                  </div>
                </div>
                <div className="w-full h-1/4 flex items-end justify-center">
                  <div
                    className={`px-3 h-7 rounded-full flex items-center justify-center font-semibold text-sm ${
                      data.data.position === "GOLEIRO"
                        ? "bg-white shadow-md"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    GOLEIRO
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 실력 */}
          <div className="bg-white rounded-2xl pb-3 overflow-hidden">
            <div
              className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                alert("실력");
              }}
            >
              <div className="flex items-center space-x-3">
                <Sparkles className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">실력</span>
              </div>
              <ChevronRight className="size-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 gap-3 bg-white rounded-2xl p-4">
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">
                  {
                    SKILL_LEVEL_OPTIONS.find(
                      (option) => option.value === data.data.skillLevel
                    )?.label
                  }
                </div>
                {/* <Label className="text-muted-foreground">
                      {
                        TEAM_LEVEL_DESCRIPTION[
                          data.data.level as keyof typeof TEAM_LEVEL_DESCRIPTION
                        ]
                      }
                    </Label> */}
              </div>
            </div>
          </div>

          {/* 경기 통계 */}
          <div className="bg-white rounded-2xl pb-3 overflow-hidden">
            <div
              className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                alert("통계");
              }}
            >
              <div className="flex items-center space-x-3">
                <ChartPie className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">참가한 경기 통계</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-500">
                  2025년
                </span>
                <ChevronRight className="size-5 text-gray-400" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 bg-white rounded-2xl p-4">
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">2</div>
                <Label className="text-muted-foreground">경기</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">0</div>
                <Label className="text-muted-foreground">득점</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">1</div>
                <Label className="text-muted-foreground">어시스트</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">0</div>
                <Label className="text-muted-foreground">MVP</Label>
              </div>
            </div>
          </div>

          {/* 연습 경기 */}
          {/* <div className="flex flex-col bg-white rounded-2xl overflow-hidden space-y-3">
            <button
              onClick={() => alert("연습 경기")}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Volleyball className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">2025년</span>
              </div>
              <ChevronRight className="size-5 text-gray-400" />
            </button>
            <div className="grid grid-cols-4 gap-3 bg-white rounded-2xl p-4">
              <div className="flex flex-col gap-1 items-center my-4">
                <div className="font-semibold">2</div>
                <Label className="text-muted-foreground">경기</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-4">
                <div className="font-semibold">0</div>
                <Label className="text-muted-foreground">득점</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-4">
                <div className="font-semibold">1</div>
                <Label className="text-muted-foreground">어시스트</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-4">
                <div className="font-semibold">0</div>
                <Label className="text-muted-foreground">출전 시간</Label>
              </div>
            </div>
          </div> */}
          {/* <div className="bg-slate-300">
            <div className="w-fit p-3">
              <FutsalPitch className="w-24" fill="gray" />
            </div>
          </div> */}
        </div>
      ) : null}
      {/* <p className="text-center text-sm text-gray-500 mt-3">
        가입일:{" "}
        {data?.data?.createdAt
          ? new Date(data?.data?.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : ""}
      </p> */}
    </div>
  );
};

export default PlayerContent;
