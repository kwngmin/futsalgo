"use client";
import { useQuery } from "@tanstack/react-query";
import { getPlayer } from "../model/actions";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Star, Target, Trophy } from "lucide-react";
import { getCurrentAge } from "@/entities/user/model/actions";
import { FOOT } from "@/entities/user/model/constants";
// import { getUser } from "@/app/(no-layout)/profile/model/actions";

export const SKILL_LEVEL_DISPLAY = {
  BEGINNER: "입문자",
  AMATEUR: "중급자",
  EXPERT: "상급자",
} as const;

export const PLAYER_BACKGROUND_DISPLAY = {
  NON_PROFESSIONAL: "비선출",
  PROFESSIONAL: "선출",
} as const;

export const POSITION_DISPLAY = {
  PIVO: "피보",
  ALA: "알라",
  FIXO: "픽소",
  GOLEIRO: "골레이로",
} as const;

const PlayerContent = ({ id }: { id: string }) => {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayer(id),
  });

  const handleGoBack = () => {
    router.back();
  };

  const getSkillIcon = (skillLevel: string) => {
    switch (skillLevel) {
      case "EXPERT":
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case "AMATEUR":
        return <Target className="w-4 h-4 text-blue-500" />;
      default:
        return <Star className="w-4 h-4 text-green-500" />;
    }
  };

  const getSkillBadgeColor = (skillLevel: string) => {
    switch (skillLevel) {
      case "EXPERT":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "AMATEUR":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-green-50 text-green-700 border-green-200";
    }
  };

  const getBackgroundBadgeColor = (playerBackground: string) => {
    return playerBackground === "PROFESSIONAL"
      ? "bg-purple-50 text-purple-700 border-purple-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl pb-16 flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="flex items-center justify-between h-16 shrink-0 px-3 bg-white border-b">
        <Button
          variant="ghost"
          size="lg"
          onClick={handleGoBack}
          className="flex items-center gap-1.5 !px-2"
        >
          <ArrowLeft style={{ width: "24px", height: "24px" }} />
        </Button>
        <h1 className="text-lg font-semibold">선수 프로필</h1>
        <div className="w-12" /> {/* 균형을 위한 빈 공간 */}
      </div>

      {data ? (
        <div className="flex-1 p-4 space-y-6">
          {/* 프로필 카드 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {/* 프로필 사진 */}
              <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image
                  width={80}
                  height={80}
                  src={data?.data?.player.image ?? "/default-avatar.png"}
                  alt="profile_image"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 기본 정보 */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {data?.data?.player.nickname}
                </h1>
                <p className="text-sm text-gray-500 mb-3">소속 팀 없음</p>

                {/* 뱃지들 */}
                <div className="flex flex-wrap gap-2">
                  {/* 실력 수준 뱃지 */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getSkillBadgeColor(
                      data?.data?.player.skillLevel as string
                    )}`}
                  >
                    {getSkillIcon(data?.data?.player.skillLevel as string)}
                    {
                      SKILL_LEVEL_DISPLAY[
                        data?.data?.player
                          .skillLevel as keyof typeof SKILL_LEVEL_DISPLAY
                      ]
                    }
                  </div>

                  {/* 선수 출신 뱃지 */}
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBackgroundBadgeColor(
                      data?.data?.player.playerBackground as string
                    )}`}
                  >
                    {
                      PLAYER_BACKGROUND_DISPLAY[
                        data?.data?.player
                          .playerBackground as keyof typeof PLAYER_BACKGROUND_DISPLAY
                      ]
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 상세 정보 그리드 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              상세 정보
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* 키 */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {data?.data?.player.height}cm
                </div>
                <div className="text-sm text-gray-500">키</div>
              </div>

              {/* 나이 */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {getCurrentAge(data?.data?.player.birthDate as string).age}살
                </div>
                <div className="text-sm text-gray-500">나이</div>
              </div>

              {/* 주발 */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {FOOT[data?.data?.player.foot as keyof typeof FOOT]}
                </div>
                <div className="text-sm text-gray-500">주로 사용하는 발</div>
              </div>

              {/* 포지션 */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {
                    POSITION_DISPLAY[
                      data?.data?.player
                        .position as keyof typeof POSITION_DISPLAY
                    ]
                  }
                </div>
                <div className="text-sm text-gray-500">선호하는 포지션</div>
              </div>
            </div>
          </div>

          {/* 추가 정보 카드 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              경력 정보
            </h2>
            <div className="space-y-4">
              {/* 선수 출신 정보 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">
                    선수 출신 여부
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {data?.data?.player.playerBackground === "PROFESSIONAL"
                      ? "전문적인 축구 경험이 있습니다"
                      : "취미로 축구를 즐깁니다"}
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getBackgroundBadgeColor(
                    data?.data?.player.playerBackground as string
                  )}`}
                >
                  {
                    PLAYER_BACKGROUND_DISPLAY[
                      data?.data?.player
                        .playerBackground as keyof typeof PLAYER_BACKGROUND_DISPLAY
                    ]
                  }
                </div>
              </div>

              {/* 실력 수준 정보 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">실력 수준</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {data?.data?.player.skillLevel === "ACE" &&
                      "숙련된 실력을 보유하고 있습니다"}
                    {data?.data?.player.skillLevel === "AMATEUR" &&
                      "중급 수준의 실력을 보유하고 있습니다"}
                    {data?.data?.player.skillLevel === "SEMIPRO" &&
                      "중급 수준의 실력을 보유하고 있습니다"}
                    {data?.data?.player.skillLevel === "BEGINNER" &&
                      "축구를 배우고 있는 단계입니다"}
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getSkillBadgeColor(
                    data?.data?.player.skillLevel as string
                  )}`}
                >
                  {getSkillIcon(data?.data?.player.skillLevel as string)}
                  {
                    SKILL_LEVEL_DISPLAY[
                      data?.data?.player
                        .skillLevel as keyof typeof SKILL_LEVEL_DISPLAY
                    ]
                  }
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <Button className="w-full h-12 text-base font-medium">
              메시지 보내기
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
            >
              팔로우하기
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
            <p className="text-gray-500">프로필을 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerContent;
