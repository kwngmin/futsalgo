"use client";

import { getCurrentAge } from "@/entities/user/model/actions";
import { GENDER } from "@/entities/user/model/constants";
import { Button } from "@/shared/components/ui/button";
import {
  TeamMember,
  TeamMemberRole,
  TeamMemberStatus,
  User,
} from "@prisma/client";
import { ChevronRight, Crown, UserRoundCog } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { approveTeamMember } from "../model/actions";
import { Separator } from "@/shared/components/ui/separator";

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
  >;
}

const TeamMemberList = ({
  members,
  isMember,
  role,
  status,
  refetch,
  teamId,
}: {
  members: {
    approved: TeamMemberWithUser[];
    pending: TeamMemberWithUser[];
  };
  isMember: boolean;
  role: TeamMemberRole | null;
  status: TeamMemberStatus | null;
  refetch: () => void;
  teamId: string;
}) => {
  console.log(role, "role");
  const router = useRouter();
  console.log(members, "members");

  // 팀원 목록 조회
  if (!isMember || (isMember && status === "PENDING")) {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        {members.approved.map((member) => (
          <button
            key={member.id}
            onClick={() => router.push(`/players/${member.userId}`)}
            className={`w-full flex items-center justify-between px-3 py-4 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0 cursor-pointer`}
          >
            <div className="flex items-center space-x-3">
              <Image
                src={member.user.image || "/assets/images/default-profile.png"}
                alt="profile"
                width={40}
                height={40}
                className="rounded-full size-10 object-cover"
              />
              <div className="flex flex-col items-start">
                <span className="text-lg sm:text-base font-semibold flex items-center gap-1.5 leading-none h-5 sm:h-6">
                  {member.user.nickname || "닉네임 없음"}
                </span>
                <span className="sm:text-sm text-gray-500">
                  {`${GENDER[member.user.gender as keyof typeof GENDER]} • ${
                    member.user.birthDate
                      ? getCurrentAge(member.user.birthDate).success
                        ? `${getCurrentAge(member.user.birthDate).age}살`
                        : "생년월일 미설정"
                      : "생년월일 미설정"
                  } • ${
                    member.user.height ? `${member.user.height}cm` : "키 미설정"
                  }`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* <span className="text-base font-medium text-gray-500">
                {member.user.name || "미설정"}
              </span>
              <Separator orientation="vertical" /> */}
              <ChevronRight className="size-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* 승인 대기 */}
        {members.pending.map((member) => (
          <div
            key={member.id}
            className="border-t border-gray-100 first:border-t-0 w-full flex flex-col sm:flex-row sm:gap-0"
          >
            <button
              onClick={() => router.push(`/players/${member.userId}`)}
              className="flex items-center justify-between gap-3 cursor-pointer sm:grow px-3 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 grow">
                <Image
                  src={
                    member.user.image || "/assets/images/default-profile.png"
                  }
                  alt="profile"
                  width={40}
                  height={40}
                  className="rounded-full size-10 object-cover"
                />
                <div className="flex flex-col items-start grow">
                  <h3 className="text-lg sm:text-base font-semibold flex items-center gap-1.5 leading-none h-5 sm:h-6">
                    {member.user.nickname || "닉네임 없음"}
                  </h3>
                  <span className="sm:text-sm text-gray-500">
                    {`${GENDER[member.user.gender as keyof typeof GENDER]} • ${
                      member.user.birthDate
                        ? getCurrentAge(member.user.birthDate).success
                          ? `${getCurrentAge(member.user.birthDate).age}살`
                          : "생년월일 미설정"
                        : "생년월일 미설정"
                    } • ${
                      member.user.height
                        ? `${member.user.height}cm`
                        : "키 미설정"
                    }`}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 sm:hidden" />
            </button>
            <div className="grid grid-cols-2 gap-2 px-3 pt-1.5 mb-4 sm:mb-0 sm:py-0 items-center">
              <Button
                variant="outline"
                className="font-semibold"
                onClick={async () => {
                  try {
                    const result = await approveTeamMember(
                      teamId,
                      member.userId
                    );
                    if (result?.success) {
                      // toast.success("팀원 승인이 완료되었습니다.");
                      alert("팀원 승인이 완료되었습니다.");
                      refetch();
                    } else {
                      alert(result?.error);
                    }
                  } catch (error) {
                    console.error(error);
                  }
                }}
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
          </div>
        ))}
        {/* 승인 완료 */}
        {members.approved.map((member) => (
          <button
            key={member.id}
            onClick={() => router.push(`/players/${member.userId}`)}
            className={`w-full flex items-center justify-between px-3 py-4 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0 cursor-pointer`}
          >
            <div className="flex items-center space-x-3">
              <Image
                src={member.user.image || "/assets/images/default-profile.png"}
                alt="profile"
                width={40}
                height={40}
                className="rounded-full size-10 object-cover"
              />
              <div className="flex flex-col items-start">
                <span className="text-lg sm:text-base font-semibold flex items-center gap-1.5 leading-none h-5 sm:h-6">
                  {member.user.nickname || "닉네임 없음"}
                  {member.role === "MANAGER" && (
                    <div className="flex items-center gap-0.5 h-5">
                      <UserRoundCog
                        className="size-5 text-indigo-700 p-0.5"
                        strokeWidth={2}
                      />
                      <span className="text-sm text-indigo-700 font-semibold">
                        매니저
                      </span>
                    </div>
                  )}
                  {member.role === "OWNER" && (
                    <div className="flex items-center gap-0.5 h-5">
                      <Crown
                        className="size-5 text-amber-700 p-0.5"
                        strokeWidth={2}
                      />
                      <span className="text-sm text-amber-700 font-semibold">
                        팀장
                      </span>
                    </div>
                  )}
                </span>
                <span className="sm:text-sm text-gray-500">
                  {`${GENDER[member.user.gender as keyof typeof GENDER]} • ${
                    member.user.birthDate
                      ? getCurrentAge(member.user.birthDate).success
                        ? `${getCurrentAge(member.user.birthDate).age}살`
                        : "생년월일 미설정"
                      : "생년월일 미설정"
                  } • ${
                    member.user.height ? `${member.user.height}cm` : "키 미설정"
                  }`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-gray-500">
                {member.user.name || "미설정"}
              </span>
              <Separator orientation="vertical" />
              <ChevronRight className="size-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TeamMemberList;
