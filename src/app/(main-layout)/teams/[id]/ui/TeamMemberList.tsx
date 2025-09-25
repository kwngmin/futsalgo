"use client";

import { Button } from "@/shared/components/ui/button";
import {
  TeamMember,
  TeamMemberRole,
  TeamMemberStatus,
  User,
} from "@prisma/client";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { approveTeamMember } from "../model/actions";
import InjuredBadge from "@/shared/components/ui/InjuredBadge";
import { getCurrentAge } from "@/entities/user/model/actions";
import { GENDER, SKILL_LEVEL } from "@/entities/user/model/constants";

// 타입 정의
interface TeamMemberWithUser extends TeamMember {
  user: Pick<
    User,
    | "id"
    | "name"
    | "nickname"
    | "image"
    | "skillLevel"
    | "playerBackground"
    | "position"
    | "birthDate"
    | "height"
    | "gender"
    | "condition"
  >;
}

interface TeamMemberListProps {
  members: {
    approved: TeamMemberWithUser[];
    pending: TeamMemberWithUser[];
  };
  isMember: boolean;
  role: TeamMemberRole | null;
  status: TeamMemberStatus | null;
  refetch: () => void;
  teamId: string;
}

interface MemberCardProps {
  member: TeamMemberWithUser;
  onClick: () => void;
  showRealName?: boolean;
  children?: React.ReactNode;
  isPending?: boolean;
}

// 멤버 정보 문자열 생성 유틸리티 함수
const getMemberInfoText = (user: TeamMemberWithUser["user"]): string => {
  const gender = GENDER[user.gender as keyof typeof GENDER];

  const age = user.birthDate
    ? getCurrentAge(user.birthDate).success
      ? `${getCurrentAge(user.birthDate).age}살`
      : "생년월일 미설정"
    : "생년월일 미설정";

  // const professional =
  //   user.playerBackground === "PROFESSIONAL" ? " • 선출" : "";

  const skillLevel =
    SKILL_LEVEL[user.skillLevel as keyof typeof SKILL_LEVEL] || "미설정";

  return `${gender} • ${age} • ${skillLevel}`;
  // return `${gender} • ${age} • ${skillLevel}${professional}`;
};

// 역할 배지 컴포넌트
const RoleBadge = ({ role }: { role: TeamMemberRole }) => {
  if (role === "MANAGER") {
    return (
      <span className="text-sm text-sky-700 font-medium mb-px">부팀장</span>
    );
  }
  if (role === "OWNER") {
    return (
      <span className="text-sm text-indigo-700 font-medium mb-px">팀장</span>
    );
  }
  return null;
};

// 멤버 카드 컴포넌트
const MemberList = ({
  member,
  onClick,
  showRealName = false,
  children,
  isPending = false,
}: MemberCardProps) => {
  return (
    <div className="border-t border-gray-100 first:border-t-0 w-full flex flex-col sm:flex-row sm:gap-0">
      <button
        onClick={onClick}
        className="flex items-center justify-between gap-3 cursor-pointer sm:grow p-2 hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center space-x-3 grow">
          {/* 프로필 이미지 */}
          <div className="relative">
            <Image
              src={member.user.image || "/assets/images/default-profile.png"}
              alt="profile"
              width={56}
              height={56}
              loading="lazy"
              className="size-12 rounded-full border object-cover"
            />
            {member.user.condition === "INJURED" && <InjuredBadge />}
          </div>

          {/* 멤버 정보 */}
          <div className="flex flex-col items-start grow">
            <h3 className="text-lg sm:text-base font-semibold flex items-center gap-1.5 leading-none h-5 sm:h-6">
              <span className="group-hover:underline underline-offset-4">
                {member.user.nickname || "닉네임 없음"}
              </span>
              <RoleBadge role={member.role} />
            </h3>
            <div className="sm:text-sm text-gray-500 tracking-tight flex items-center">
              {member.user.playerBackground === "PROFESSIONAL" && (
                <span className="text-gray-600 font-medium pr-2 py-0.5 mr-2 border-r border-gray-300 h-4 flex items-center">
                  선수 출신
                </span>
              )}
              {getMemberInfoText(member.user)}
            </div>
          </div>
        </div>

        {/* 우측 콘텐츠 */}
        <div className="flex items-center gap-1">
          {showRealName ? (
            <span className="text-base font-medium text-gray-500">
              {member.user.name || "미설정"}
            </span>
          ) : isPending ? (
            <span className="text-base font-medium text-amber-600">대기중</span>
          ) : null}
          <ChevronRight className="size-5 text-gray-400" />
        </div>
      </button>

      {/* 추가 액션 버튼 (승인/거절) */}
      {children}
    </div>
  );
};

// 승인 대기 멤버 액션 버튼
const PendingMemberActions = ({
  member,
  teamId,
  onApprove,
}: {
  member: TeamMemberWithUser;
  teamId: string;
  onApprove: () => void;
}) => {
  const handleApprove = async () => {
    try {
      const result = await approveTeamMember(teamId, member.userId);
      if (result?.success) {
        // TODO: toast 라이브러리 사용 권장
        alert("팀원 승인이 완료되었습니다.");
        onApprove();
      } else {
        alert(result?.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 px-3 pt-1.5 mb-4 sm:mb-0 sm:py-0 items-center">
      <Button
        variant="outline"
        className="font-semibold"
        onClick={handleApprove}
      >
        승인
      </Button>
      <Button
        variant="secondary"
        className="text-destructive bg-destructive/10 hover:bg-destructive/20"
      >
        거절
      </Button>
    </div>
  );
};

// 메인 컴포넌트
const TeamMemberList = ({
  members,
  isMember,
  role,
  status,
  refetch,
  teamId,
}: TeamMemberListProps) => {
  const router = useRouter();
  console.log(role, "role");

  // 비회원 또는 승인 대기 중인 회원이 보는 뷰
  if (!isMember || status === "PENDING") {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        {members.approved.map((member) => (
          <MemberList
            key={member.id}
            member={member}
            onClick={() => router.push(`/players/${member.userId}`)}
          />
        ))}
      </div>
    );
  }

  // 정식 회원이 보는 뷰 (승인 대기 + 승인 완료 멤버)
  return (
    <div className="flex flex-col space-y-3">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* 승인 대기 멤버 */}
        {members.pending.map((member) => (
          <MemberList
            key={member.id}
            member={member}
            onClick={() => router.push(`/players/${member.userId}`)}
            isPending={true}
          >
            {role === "OWNER" ||
              (role === "MANAGER" && (
                <PendingMemberActions
                  member={member}
                  teamId={teamId}
                  onApprove={refetch}
                />
              ))}
          </MemberList>
        ))}

        {/* 승인 완료 멤버 */}
        {members.approved.map((member) => (
          <MemberList
            key={member.id}
            member={member}
            onClick={() => router.push(`/players/${member.userId}`)}
            showRealName
          />
        ))}
      </div>
    </div>
  );
};

export default TeamMemberList;
