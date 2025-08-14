// components/team/team-member-rating-list.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rateTeamMember } from "../actions/rate-team-memer";

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    nickname: string | null;
    image: string | null;
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
  { key: "shooting", label: "슈팅", icon: "⚽" },
  { key: "passing", label: "패스", icon: "🎯" },
  { key: "stamina", label: "체력", icon: "💪" },
  { key: "physical", label: "피지컬", icon: "🏃" },
  { key: "dribbling", label: "드리블", icon: "⚡" },
  { key: "defense", label: "수비", icon: "🛡️" },
] as const;

export default function TeamMemberRatingList({
  members,
  teamId,
  currentUserId,
}: Props) {
  console.log(currentUserId, "currentUserId");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ratings, setRatings] = useState<RatingData>({
    shooting: 1,
    passing: 1,
    stamina: 1,
    physical: 1,
    dribbling: 1,
    defense: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const openModal = (member: Member) => {
    setSelectedMember(member);
    // 기존 평가가 있다면 해당 값으로 초기화, 없다면 1로 초기화
    if (member.currentRating) {
      setRatings(member.currentRating);
    } else {
      setRatings({
        shooting: 1,
        passing: 1,
        stamina: 1,
        physical: 1,
        dribbling: 1,
        defense: 1,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setRatings({
      shooting: 1,
      passing: 1,
      stamina: 1,
      physical: 1,
      dribbling: 1,
      defense: 1,
    });
  };

  const handleRatingChange = (key: keyof RatingData, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [key]: value,
    }));
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
      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openModal(member)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
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

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {member.user.nickname || member.user.name || "이름 없음"}
                  </h3>
                  {member.user.nickname && member.user.name && (
                    <p className="text-sm text-gray-600">{member.user.name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {member.hasRated ? (
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      평가 완료
                    </span>
                    {member.ratedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(member.ratedAt), "MM월 dd일", {
                          locale: ko,
                        })}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    평가 대기
                  </span>
                )}

                <div className="text-gray-400">→</div>
              </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedMember.user.nickname || selectedMember.user.name}{" "}
                  평가하기
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {RATING_ITEMS.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{item.icon}</span>
                      <label className="font-medium text-gray-700">
                        {item.label}
                      </label>
                      <span className="ml-auto text-lg font-semibold text-blue-600">
                        {ratings[item.key]}점
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => handleRatingChange(item.key, score)}
                          className={`w-10 h-10 rounded-full border-2 font-semibold transition-colors ${
                            ratings[item.key] >= score
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "border-gray-300 text-gray-400 hover:border-blue-300"
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
