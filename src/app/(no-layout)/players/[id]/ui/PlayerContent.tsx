"use client";
import { useQuery } from "@tanstack/react-query";
import { getPlayer } from "../model/actions";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ChevronRight, Share, Volleyball } from "lucide-react";
import { getCurrentAge, maskName } from "@/entities/user/model/actions";
import {
  FOOT,
  PLAYER_BACKGROUND,
  SKILL_LEVEL,
  GENDER,
  SPORT_TYPE,
} from "@/entities/user/model/constants";
import { Label } from "@/shared/components/ui/label";

import { useSession } from "next-auth/react";
import MannerBar from "./MannerBar";

const PlayerContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const session = useSession();

  const { data } = useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayer(id),
  });
  console.log(data, "player");

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between h-16 shrink-0 px-3">
        <div className="w-20">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleGoBack}
            className="flex items-center gap-1.5 !px-2"
          >
            <ArrowLeft style={{ width: "24px", height: "24px" }} />
          </Button>
        </div>
        <h1 className="grow flex justify-center text-lg font-semibold">
          선수 정보
        </h1>
        <div className="w-20 flex justify-end gap-3 px-3">
          <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-colors cursor-pointer">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>
      {data ? (
        <div className="px-3 space-y-4">
          <div className="bg-white rounded-2xl">
            <div className="flex justify-end p-3">
              {id === session.data?.user.id ? (
                <div className="h-7" />
              ) : (
                <Button
                  size="sm"
                  className="rounded-full font-semibold text-sm py-0 px-4 h-7"
                  variant="outline"
                >
                  팔로우
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4 px-6 h-20">
              {/* 프로필 사진 */}
              <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image
                  width={80}
                  height={80}
                  src={data?.data?.player.image ?? ""}
                  alt="profile_image"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">
                  {data?.data?.player.nickname}
                </h1>
                <p className="text-base font-medium">
                  {/* 소속 팀 없음 */}
                  {`${
                    data?.data?.player.name
                      ? id === session.data?.user.id
                        ? data?.data?.player.name
                        : maskName(data?.data?.player.name)
                      : "이름 없음"
                  } • ${
                    data?.data?.player.gender
                      ? `${
                          GENDER[
                            data?.data?.player.gender as keyof typeof GENDER
                          ]
                        }`
                      : "성별 미설정"
                  }`}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  가입일:{" "}
                  {data?.data?.player.createdAt
                    ? new Date(data?.data?.player.createdAt).toLocaleDateString(
                        "ko-KR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : ""}
                </p>
              </div>
            </div>
            <MannerBar score={Math.floor(Math.random() * 100)} />
          </div>
          <div className="bg-white rounded-lg overflow-hidden opacity-50 pointer-events-none">
            <button
              onClick={() => alert("플레이 정보 통계")}
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <div className="size-6 bg-gray-200 rounded-full" />
                <span className="font-medium">소속 팀 없음</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400}`} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl">
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">{data?.data?.player.height}cm</div>
              <Label className="text-muted-foreground">키</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">
                {getCurrentAge(data?.data?.player.birthDate as string).age}살
              </div>
              <Label className="text-muted-foreground">나이</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">
                {FOOT[data?.data?.player.foot as keyof typeof FOOT]}
              </div>
              <Label className="text-muted-foreground">사용하는 발</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">
                {
                  SPORT_TYPE[
                    data?.data?.player.sportType as keyof typeof SPORT_TYPE
                  ]
                }
              </div>
              <Label className="text-muted-foreground">종목</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">
                {
                  PLAYER_BACKGROUND[
                    data?.data?.player
                      .playerBackground as keyof typeof PLAYER_BACKGROUND
                  ]
                }
              </div>
              <Label className="text-muted-foreground">출신</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-4">
              <div className="font-semibold">
                {
                  SKILL_LEVEL[
                    data?.data?.player.skillLevel as keyof typeof SKILL_LEVEL
                  ]
                }
              </div>
              <Label className="text-muted-foreground">실력</Label>
            </div>
          </div>

          {/* 통계 */}
          {/* <div className="bg-white rounded-lg overflow-hidden">
           */}

          {/* 경기 년도 선택 */}
          {/* <div className="flex items-center justify-between gap-2">
            <h2 className="font-medium text-gray-600 px-2 text-sm">
              경기 년도 선택 :
            </h2>
            <Select>
              <SelectTrigger className="grow bg-white">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">2025년</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          <div className="flex flex-col bg-white rounded-2xl overflow-hidden space-y-3">
            <button
              onClick={() => alert("친선 경기")}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <Volleyball className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">
                  친선 경기
                  <span className="text-gray-400 px-2 text-sm">
                    우리 팀 vs 외부 팀
                  </span>
                </span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400}`} />
            </button>
            <div className="grid grid-cols-4 gap-3 bg-white rounded-2xl mb-6 px-3">
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">11</div>
                <Label className="text-muted-foreground">경기</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">2</div>
                <Label className="text-muted-foreground">득점</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">5</div>
                <Label className="text-muted-foreground">어시스트</Label>
              </div>
              <div className="flex flex-col gap-1 items-center my-3">
                <div className="font-semibold">8</div>
                <Label className="text-muted-foreground">출전 시간</Label>
              </div>
            </div>
          </div>
          <div className="flex flex-col bg-white rounded-2xl overflow-hidden space-y-3">
            <button
              onClick={() => alert("연습 경기")}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <Volleyball className={`w-5 h-5 text-gray-600`} />
                <span className="font-medium">
                  연습 경기
                  <span className="text-gray-400 px-2 text-sm">
                    우리 팀 vs 우리 팀
                  </span>
                </span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400}`} />
            </button>
            <div className="grid grid-cols-4 gap-3 bg-white rounded-2xl mb-6 px-3">
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
                <Label className="text-muted-foreground">출전 시간</Label>
              </div>
            </div>
          </div>
          {/* <div className="bg-slate-300">
            <div className="w-fit p-3">
              <FutsalPitch className="w-24" fill="gray" />
            </div>
          </div> */}
        </div>
      ) : null}
    </div>
  );
};

export default PlayerContent;
