"use client";

import { getCurrentAge } from "@/entities/user/model/actions";
import { GENDER } from "@/entities/user/model/constants";
import { Button } from "@/shared/components/ui/button";
import { TeamMember, TeamMemberRole, User } from "@prisma/client";
import { ChevronRight, Mars, Venus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

const TeamPlayers = ({
  members,
  isMember,
  role,
}: {
  members: TeamMemberWithUser[];
  isMember: boolean;
  role: TeamMemberRole | null;
}) => {
  console.log(role, "role");
  const router = useRouter();
  console.log(members, "members");

  const pendingMembers = members.filter(
    (member) => member.status === "PENDING"
  );
  const approvedMembers = members.filter(
    (member) => member.status === "APPROVED"
  );

  //   const age = getCurrentAge(member.user.birthDate as string);
  if (!isMember) {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        {approvedMembers.map((member) => (
          <button
            key={member.id}
            onClick={() => router.push(`/players/${member.userId}`)}
            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0`}
          >
            <div className="flex items-center space-x-3">
              <Image
                src={member.user.image || "/assets/images/default-profile.png"}
                alt="profile"
                width={40}
                height={40}
                className="rounded-full"
              />{" "}
              <span className="font-medium">
                {member.user.nickname || "팀원"}
              </span>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400}`} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 px-2 text-gray-600">
          승인 대기
        </h3>
        <div className="bg-white rounded-lg overflow-hidden">
          {pendingMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col pb-2 border-t border-gray-100 first:border-t-0"
            >
              <button
                onClick={() => router.push(`/players/${member.userId}`)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src={
                      member.user.image || "/assets/images/default-profile.png"
                    }
                    alt="profile"
                    width={40}
                    height={40}
                    className="rounded-full size-10"
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-medium flex items-center gap-1.5">
                      {member.user.nickname || "닉네임 없음"}
                      {member.user.gender === "MALE" ? (
                        <div className="flex items-center bg-blue-500/5 rounded p-0.5">
                          <Mars
                            className="size-4 stroke-blue-700"
                            strokeWidth={2}
                          />
                          {/* <span className="text-sm text-gray-500">남</span> */}
                        </div>
                      ) : (
                        <div className="flex items-center bg-red-500/5 rounded p-0.5">
                          <Venus
                            className="size-4 stroke-red-700"
                            strokeWidth={2}
                          />
                        </div>
                      )}
                    </span>
                    <span className="text-sm text-gray-500">
                      {`${member.user.name || "미설정"} • ${
                        GENDER[member.user.gender as keyof typeof GENDER]
                      } • ${
                        member.user.birthDate
                          ? getCurrentAge(member.user.birthDate).success
                            ? `${getCurrentAge(member.user.birthDate).age}세`
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
                <ChevronRight className={`w-5 h-5 text-gray-400}`} />
              </button>
              <div className="mx-3 p-1 grid grid-cols-2 gap-2">
                <Button className="font-semibold">승인</Button>
                <Button variant="secondary">거절</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 px-2 text-gray-600">
          승인 완료
        </h3>
        <div className="bg-white rounded-lg overflow-hidden">
          {approvedMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => router.push(`/players/${member.userId}`)}
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0`}
            >
              <div className="flex items-center space-x-3">
                <Image
                  src={
                    member.user.image || "/assets/images/default-profile.png"
                  }
                  alt="profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex flex-col items-start">
                  <span className="font-medium flex items-center gap-1.5">
                    {member.user.nickname || "닉네임 없음"}
                    {member.user.gender === "MALE" ? (
                      <div className="flex items-center bg-blue-500/5 rounded p-0.5">
                        <Mars
                          className="size-4 stroke-blue-700"
                          strokeWidth={2}
                        />
                        {/* <span className="text-sm text-gray-500">남</span> */}
                      </div>
                    ) : (
                      <div className="flex items-center bg-red-500/5 rounded p-0.5">
                        <Venus
                          className="size-4 stroke-red-700"
                          strokeWidth={2}
                        />
                      </div>
                    )}
                  </span>
                  <span className="text-sm text-gray-500">
                    {`${member.user.name || "미설정"} • ${
                      GENDER[member.user.gender as keyof typeof GENDER]
                    } • ${
                      member.user.birthDate
                        ? getCurrentAge(member.user.birthDate).success
                          ? `${getCurrentAge(member.user.birthDate).age}세`
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
              <ChevronRight className={`w-5 h-5 text-gray-400}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPlayers;
