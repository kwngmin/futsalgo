"use client";
import { useQuery } from "@tanstack/react-query";
import { getPlayer } from "../model/actions";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getCurrentAge } from "@/entities/user/model/actions";
import { FOOT } from "@/entities/user/model/constants";
import { Label } from "@/shared/components/ui/label";
// import FutsalPitchOutline from "/public/futsalpitch_outline.svg";
// import FutsalPitch from "/public/futsalpitch.svg";
import {
  PLAYER_BACKGROUND_DISPLAY,
  SKILL_LEVEL_DISPLAY,
} from "./PlayerContent.test";
// import { getUser } from "@/app/(no-layout)/profile/model/actions";

const PlayerContent = ({ id }: { id: string }) => {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayer(id),
  });
  console.log(data, "player");

  const handleGoBack = () => {
    router.back();
  };

  return (
    // <div className="min-h-screen bg-gray-50">
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl pb-16 flex flex-col">
      {/* 헤더 */}
      {/* <div className="bg-white border-b">
        <div className="flex items-center px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="mr-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">프로필</h1>
        </div>
      </div> */}
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between h-16 shrink-0 px-3">
        <Button
          variant="ghost"
          size="lg"
          onClick={handleGoBack}
          className="flex items-center gap-1.5 !px-2"
          // className="mr-2"
        >
          <ArrowLeft
            // size={32}
            // className="h-12 w-12"
            style={{ width: "24px", height: "24px" }}
          />
          {/* <h1 className="text-2xl font-bold">{data?.data?.player.nickname}</h1> */}
        </Button>
        {/* <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-colors cursor-pointer">
          <Search className="w-5 h-5" />
        </button> */}
        <Button variant="ghost" size="lg">
          팔로우
        </Button>
      </div>
      {data ? (
        <div className="px-3 space-y-4">
          <div className="flex gap-6 items-center px-8 bg-white rounded-2xl py-6">
            {/* 프로필 사진 */}
            <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                width={80}
                height={80}
                src={data?.data?.player.image ?? ""}
                alt="profile_image"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold">
                {data?.data?.player.nickname}
              </h1>
              <p className="text-sm text-gray-500 font-medium">소속 팀 없음</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl">
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">{data?.data?.player.height}cm</div>
              <Label className="text-muted-foreground">키</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">
                {getCurrentAge(data?.data?.player.birthDate as string).age}살
              </div>
              <Label className="text-muted-foreground">나이</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">
                {FOOT[data?.data?.player.foot as keyof typeof FOOT]}
              </div>
              <Label className="text-muted-foreground">주로 사용하는 발</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">{data?.data?.player.position}</div>
              <Label className="text-muted-foreground">선호하는 포지션</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">
                {
                  PLAYER_BACKGROUND_DISPLAY[
                    data?.data?.player
                      .playerBackground as keyof typeof PLAYER_BACKGROUND_DISPLAY
                  ]
                }
              </div>
              <Label className="text-muted-foreground">출신</Label>
            </div>
            <div className="flex flex-col gap-1 items-center my-3">
              <div className="font-semibold">
                {
                  SKILL_LEVEL_DISPLAY[
                    data?.data?.player
                      .skillLevel as keyof typeof SKILL_LEVEL_DISPLAY
                  ]
                }
              </div>
              <Label className="text-muted-foreground">실력</Label>
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
