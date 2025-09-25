"use client";

import { Button } from "@/shared/components/ui/button";
import {
  TeamMember,
  TeamMemberRole,
  TeamMemberStatus,
  User,
} from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { approveTeamMember } from "../model/actions";
import InjuredBadge from "@/shared/components/ui/InjuredBadge";
import {
  formatPhoneNumber,
  getCurrentAge,
} from "@/entities/user/model/actions";
import { GENDER, SKILL_LEVEL } from "@/entities/user/model/constants";
import { Copy, MessageCircle, Phone } from "lucide-react";
import { useState, useCallback } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

const ROLE_CONFIG = {
  MANAGER: { label: "부팀장", className: "text-sky-700" },
  OWNER: { label: "팀장", className: "text-indigo-700" },
} as const;

const TOAST_MESSAGES = {
  PHONE_COPIED: "전화번호가 복사되었습니다.",
  COPY_FAILED: "복사에 실패했습니다.",
  MEMBER_APPROVED: "팀원 승인이 완료되었습니다.",
  APPROVAL_FAILED: "승인 처리 중 오류가 발생했습니다.",
} as const;

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
    | "phone"
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
  userId?: string;
}

interface MemberCardProps {
  member: TeamMemberWithUser;
  onClick: () => void;
  showRealName?: boolean;
  children?: React.ReactNode;
  isPending?: boolean;
  isMe?: boolean;
}

// 유틸리티 함수들
const getMemberInfoText = (user: TeamMemberWithUser["user"]): string => {
  const gender = GENDER[user.gender as keyof typeof GENDER];
  const age = user.birthDate
    ? getCurrentAge(user.birthDate).success
      ? `${getCurrentAge(user.birthDate).age}살`
      : "생년월일 미설정"
    : "생년월일 미설정";

  const skillLevel =
    SKILL_LEVEL[user.skillLevel as keyof typeof SKILL_LEVEL] || "미설정";

  return `${gender} • ${age} • ${skillLevel}`;
};

const getContactUrl = (type: "tel" | "sms", phone: string): string => {
  return `${type}:${formatPhoneNumber(phone)}`;
};

// 역할 배지 컴포넌트
const RoleBadge = ({ role }: { role: TeamMemberRole }) => {
  const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];

  if (!config) return null;

  return (
    <span className={`text-sm font-medium mb-px ${config.className}`}>
      {config.label}
    </span>
  );
};

// 연락처 액션 버튼 컴포넌트
const ContactActionButton = ({
  type,
  phone,
  className,
}: {
  type: "tel" | "sms";
  phone: string;
  className?: string;
}) => {
  const IconComponent = type === "tel" ? Phone : MessageCircle;
  const fillColor =
    type === "tel" ? "oklch(62.7% 0.194 149.214)" : "oklch(44.4% 0.011 73.639)";
  const hoverBorder =
    type === "tel" ? "hover:border-green-600" : "hover:border-zinc-600";

  return (
    <a
      href={getContactUrl(type, phone)}
      className={`flex items-center justify-center rounded-full bg-white size-11 border hover:shadow-md ${hoverBorder} transition-shadow cursor-pointer ${className}`}
    >
      <IconComponent fill={fillColor} strokeWidth={0} className="size-5" />
    </a>
  );
};

// 전화번호 복사 버튼 컴포넌트
const PhoneCopyButton = ({ phone }: { phone?: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!phone) return;

    try {
      await navigator.clipboard.writeText(formatPhoneNumber(phone));
      setIsCopied(true);
      toast.success(TOAST_MESSAGES.PHONE_COPIED);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error(TOAST_MESSAGES.COPY_FAILED);
    }
  }, [phone]);

  return (
    <button
      type="button"
      className="hidden sm:flex items-center justify-center rounded-full bg-white h-9 pr-1.5 pl-4 border border-gray-300 hover:shadow-md hover:border-gray-600 transition-shadow cursor-pointer gap-1.5 active:scale-98 font-medium"
      onClick={handleCopy}
    >
      {phone ? formatPhoneNumber(phone) : "미설정"}
      <div className="w-6 flex justify-center">
        {isCopied ? (
          <CheckCircleIcon weight="fill" className="size-6 text-blue-600" />
        ) : (
          <Copy className="size-4" />
        )}
      </div>
    </button>
  );
};

// 멤버 카드 컴포넌트
const MemberCard = ({
  member,
  onClick,
  showRealName = false,
  children,
  isPending = false,
  isMe = false,
}: MemberCardProps) => {
  const displayName = member.user.nickname || "닉네임 없음";
  const realName = member.user.name || "미설정";

  return (
    <div className="w-full flex flex-col sm:flex-row sm:gap-0">
      <div className="flex items-center justify-between gap-3 sm:grow p-2 hover:bg-gray-50 transition-colors">
        <div
          className="flex items-center space-x-3 group cursor-pointer"
          onClick={onClick}
        >
          {/* 프로필 이미지 */}
          <div className="relative">
            <Image
              src={member.user.image || "/assets/images/default-profile.png"}
              alt={`${displayName}의 프로필`}
              width={56}
              height={56}
              loading="lazy"
              className="size-11 sm:size-12 rounded-full border object-cover"
            />
            {member.user.condition === "INJURED" && <InjuredBadge />}
          </div>

          {/* 멤버 정보 */}
          <div className="flex flex-col items-start grow">
            <h3 className="text-lg sm:text-base font-semibold flex items-center gap-1.5 h-6">
              <span className="group-hover:underline underline-offset-4">
                {displayName}
              </span>
              <RoleBadge role={member.role} />
            </h3>

            {showRealName ? (
              <span className="sm:text-sm font-medium text-gray-500 leading-tight tracking-tight">
                {realName}
              </span>
            ) : isPending ? (
              <span className="sm:text-sm font-medium text-amber-600 leading-tight tracking-tight">
                대기중
              </span>
            ) : (
              <div className="sm:text-sm text-gray-500 tracking-tight flex items-center leading-tight">
                {getMemberInfoText(member.user)}
                {member.user.playerBackground === "PROFESSIONAL" && (
                  <span className="text-red-600 pl-1.5 ml-1.5 border-l border-gray-300 h-3 flex items-center">
                    선출
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 우측 콘텐츠 */}
        {isMe ? (
          <span className="px-2 text-muted-foreground">내 계정</span>
        ) : (
          <div className="flex items-center gap-2">
            {showRealName && member.user.phone && (
              <>
                <ContactActionButton
                  type="tel"
                  phone={member.user.phone}
                  className="sm:hidden"
                />
                <ContactActionButton
                  type="sms"
                  phone={member.user.phone}
                  className="sm:hidden"
                />
                <PhoneCopyButton phone={member.user.phone} />
              </>
            )}
          </div>
        )}
      </div>

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
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const result = await approveTeamMember(teamId, member.userId);
      if (result?.success) {
        toast.success(TOAST_MESSAGES.MEMBER_APPROVED);
        onApprove();
      } else {
        toast.error(result?.error || TOAST_MESSAGES.APPROVAL_FAILED);
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(TOAST_MESSAGES.APPROVAL_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 px-3 pt-1.5 mb-4 sm:mb-0 sm:py-0 items-center">
      <Button
        variant="outline"
        className="font-semibold"
        onClick={handleApprove}
        disabled={isLoading}
      >
        {isLoading ? "승인 중..." : "승인"}
      </Button>
      <Button
        variant="secondary"
        className="text-destructive bg-destructive/10 hover:bg-destructive/20"
        disabled={isLoading}
      >
        거절
      </Button>
    </div>
  );
};

// 멤버 리스트 렌더링 함수
const renderMemberList = (
  members: TeamMemberWithUser[],
  userId: string | undefined,
  router: ReturnType<typeof useRouter>,
  options: {
    showRealName?: boolean;
    isPending?: boolean;
    renderActions?: (member: TeamMemberWithUser) => React.ReactNode;
  } = {}
) => {
  return members.map((member) => (
    <MemberCard
      key={member.id}
      member={member}
      onClick={() => router.push(`/players/${member.userId}`)}
      showRealName={options.showRealName}
      isPending={options.isPending}
      isMe={member.userId === userId}
    >
      {options.renderActions?.(member)}
    </MemberCard>
  ));
};

// 메인 컴포넌트
const TeamMemberList = ({
  members,
  isMember,
  role,
  status,
  refetch,
  teamId,
  userId,
}: TeamMemberListProps) => {
  const router = useRouter();
  const canManageMembers = role === "OWNER" || role === "MANAGER";

  // 비회원 또는 승인 대기 중인 회원이 보는 뷰
  if (!isMember || status === "PENDING") {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        {renderMemberList(members.approved, userId, router)}
      </div>
    );
  }

  // 정식 회원이 보는 뷰
  return (
    <div className="flex flex-col space-y-3">
      <div className="bg-white rounded-lg overflow-hidden divide-y divide-gray-100">
        {/* 승인 대기 멤버 */}
        {renderMemberList(members.pending, userId, router, {
          isPending: true,
          renderActions: canManageMembers
            ? (member) => (
                <PendingMemberActions
                  member={member}
                  teamId={teamId}
                  onApprove={refetch}
                />
              )
            : undefined,
        })}

        {/* 승인 완료 멤버 */}
        {renderMemberList(members.approved, userId, router, {
          showRealName: true,
        })}
      </div>
    </div>
  );
};

export default TeamMemberList;
