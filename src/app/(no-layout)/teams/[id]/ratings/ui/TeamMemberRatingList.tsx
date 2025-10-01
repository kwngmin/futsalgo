// components/team/team-member-rating-list.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rateTeamMember } from "../actions/rate-team-memer";
import { Separator } from "@/shared/components/ui/separator";
import { SquarePen } from "lucide-react";
import { PlayerSkillLevel } from "@prisma/client";
import CustomSelect from "@/shared/components/ui/custom-select";
import { SKILL_LEVEL_OPTIONS } from "@/entities/user/model/constants";
import { SKILL_LEVEL_POINTS } from "@/app/onboarding/ui/OnboardingProfile";

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    nickname: string | null;
    image: string | null;
    skillLevel: PlayerSkillLevel;
  };
  hasRated: boolean;
  ratedAt: Date | null;
  currentRating: {
    shooting: number;
    passing: number;
    stamina: number;
    physical: number;
    dribbling: number;
    defense: number;
  } | null;
}

interface Props {
  members: Member[];
  teamId: string;
  currentUserId: string;
}

interface RatingData {
  shooting: number;
  passing: number;
  stamina: number;
  physical: number;
  dribbling: number;
  defense: number;
}

const RATING_ITEMS = [
  { key: "shooting", label: "슈팅" },
  { key: "passing", label: "패스" },
  { key: "stamina", label: "체력" },
  { key: "physical", label: "피지컬" },
  { key: "dribbling", label: "드리블" },
  { key: "defense", label: "수비" },
] as const;

// 초기 ratings 값 상수로 추출 (DRY 원칙)
const INITIAL_RATINGS: RatingData = {
  shooting: 1,
  passing: 1,
  stamina: 1,
  physical: 1,
  dribbling: 1,
  defense: 1,
};

export default function TeamMemberRatingList({
  members,
  teamId,
  currentUserId,
}: Props) {
  console.log(currentUserId, "currentUserId");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ratings, setRatings] = useState<RatingData>(INITIAL_RATINGS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [skillLevel, setSkillLevel] = useState<PlayerSkillLevel | null>(null);

  const openModal = (member: Member) => {
    setSelectedMember(member);
    setSkillLevel(member.user.skillLevel);
    // 기존 평가가 있다면 해당 값으로 초기화, 없다면 1로 초기화
    if (member.currentRating) {
      // 명시적으로 필요한 속성만 추출하여 설정
      setRatings({
        shooting: member.currentRating.shooting,
        passing: member.currentRating.passing,
        stamina: member.currentRating.stamina,
        physical: member.currentRating.physical,
        dribbling: member.currentRating.dribbling,
        defense: member.currentRating.defense,
      });
    } else {
      setRatings(INITIAL_RATINGS);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setRatings(INITIAL_RATINGS);
    setSkillLevel(null);
  };

  // 선택한 실력 등급에 따른 최대 포인트 (안전하게 처리)
  const maxPoints = useMemo(() => {
    if (!skillLevel) return 0;
    return SKILL_LEVEL_POINTS[skillLevel] ?? 0;
  }, [skillLevel]);

  console.log(skillLevel, "skillLevel");

  // 현재 사용한 총 포인트 계산 (정의된 rating 항목만 사용)
  const totalUsedPoints = useMemo(() => {
    return RATING_ITEMS.reduce((sum, item) => sum + ratings[item.key], 0);
  }, [ratings]);

  // 남은 포인트
  const remainingPoints = maxPoints - totalUsedPoints;
  console.log(remainingPoints, "remainingPoints");
  console.log(maxPoints, "maxPoints");
  console.log(totalUsedPoints, "totalUsedPoints");

  // 남은 포인트가 음수일 때 ratings 초기화
  useEffect(() => {
    if (remainingPoints < 0) {
      setRatings(INITIAL_RATINGS);
    }
  }, [remainingPoints]);

  const handleRatingChange = (key: keyof RatingData, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 특정 점수 버튼이 비활성화되어야 하는지 확인
  const isScoreDisabled = (currentItemKey: keyof RatingData, score: number) => {
    const currentValue = ratings[currentItemKey];
    const pointDifference = score - currentValue;
    return totalUsedPoints + pointDifference > maxPoints;
  };

  const handleSubmit = async () => {
    if (!selectedMember) return;

    setIsSubmitting(true);
    try {
      const result = await rateTeamMember({
        teamId,
        toUserId: selectedMember.userId,
        ratings,
      });

      if (result.success) {
        toast.success("평가가 저장되었습니다.");
        closeModal();
        router.refresh(); // 페이지 새로고침으로 최신 데이터 반영
      } else {
        toast.error(result.error || "평가 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      toast.error("평가 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg px-4 h-16 flex items-center hover:bg-gray-50 transition-shadow cursor-pointer"
            onClick={() => openModal(member)}
          >
            <div className="flex items-center space-x-4 grow">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                {member.user.image ? (
                  <Image
                    src={member.user.image}
                    alt={member.user.nickname || member.user.name || ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    👤
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold">
                    {member.user.nickname || member.user.name || "이름 없음"}
                  </h3>
                  <Separator
                    orientation="vertical"
                    className="!h-3 bg-gray-300"
                  />
                  {member.user.nickname && member.user.name && (
                    <p className="text-sm text-gray-800">{member.user.name}</p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {member.hasRated ? (
                    <div className="text-sm">
                      {member.ratedAt && (
                        <span className="text-gray-500">
                          {new Date(member.ratedAt).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      )}
                      <span className="text-gray-400"> • </span>
                      <span className="text-gray-500">평가 완료</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      평가 대기
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center size-10 bg-white rounded-lg">
              <SquarePen className="size-5 text-gray-500" />
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">평가할 팀원이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 평가 모달 */}
      {isModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* header */}
            <div className="flex items-center justify-between px-4 h-16">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-medium text-gray-900">
                  {selectedMember.user.nickname}
                </h2>
                <span className="text-muted-foreground">
                  {selectedMember.user.name}
                </span>
              </div>

              {/* 남은 포인트 */}
              <span
                className={`px-1 text-sm font-semibold ${
                  remainingPoints === 0
                    ? "text-green-600"
                    : remainingPoints < 0
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {remainingPoints} / {maxPoints}
              </span>
            </div>

            {/* skill level */}
            <div className="px-4 flex mb-2">
              <CustomSelect
                size="sm"
                value={skillLevel || ""}
                onChange={(e) =>
                  setSkillLevel(e.target.value as PlayerSkillLevel)
                }
                options={SKILL_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                aria-label="skillLevel"
                isPlaceholderSelectable={false}
                className="w-40 grow shrink-0"
              />
            </div>

            {/* rating items */}
            <div className="px-4 divide-y divide-gray-100">
              {RATING_ITEMS.map((item, index) => (
                <div
                  key={item.key}
                  className="h-18 sm:h-16 flex items-center justify-between space-x-2 gap-1"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-gray-300">{index + 1}.</span>
                    <label className="sm:text-sm font-medium text-gray-700">
                      {item.label}
                    </label>
                  </div>
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((score) => {
                      const disabled = isScoreDisabled(item.key, score);
                      const isSelected = ratings[item.key] >= score;

                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleRatingChange(item.key, score)}
                          disabled={disabled}
                          className={`size-10 sm:size-9 rounded-full border transition-colors cursor-pointer ${
                            isSelected
                              ? "font-semibold bg-gray-700 border-transparent hover:bg-gray-500 text-white"
                              : disabled
                              ? "font-medium border-transparent text-gray-300 cursor-not-allowed bg-gray-50"
                              : "font-medium border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-700 cursor-pointer"
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                    <span className="hidden sm:block text-gray-600 ml-4 min-w-10 text-center">
                      <span className="font-medium text-gray-800">
                        {ratings[item.key]}
                      </span>
                      점
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* footer */}
            <div className="flex gap-2 p-4">
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="flex-1 px-4 h-11 sm:h-10 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 h-11 sm:h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer font-medium"
              >
                {isSubmitting ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
