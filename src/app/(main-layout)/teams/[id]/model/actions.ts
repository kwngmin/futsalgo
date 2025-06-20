"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { TeamMemberStatus } from "@prisma/client";

interface UserMembershipInfo {
  isMember: boolean;
  status: TeamMemberStatus | null;
  joinedAt: Date | null;
}

export async function getTeam(id: string) {
  const session = await auth();

  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          where: { status: "APPROVED" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                nickname: true,
                image: true,
                skillLevel: true,
                playerBackground: true,
                position: true,
                birthDate: true,
                height: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return {
        success: false,
        error: "팀을 찾을 수 없습니다",
        data: null,
      };
    }

    // 승인된 멤버들만 필터링
    const approvedMembers = team.members.filter(
      (member) => member.status === "APPROVED"
    );

    // 현재 사용자의 멤버십 정보 확인
    const currentUserMembership: UserMembershipInfo = session?.user?.id
      ? (() => {
          const userMember = team.members.find(
            (member) => member.user.id === session.user.id
          );

          return {
            isMember: !!userMember,
            status: userMember?.status || null,
            joinedAt: userMember?.createdAt || null,
          };
        })()
      : {
          isMember: false,
          status: null,
          joinedAt: null,
        };

    // 통계 계산을 위한 헬퍼 함수들
    const calculateAverageAge = (members: typeof approvedMembers) => {
      const membersWithBirthDate = members.filter((m) => m.user.birthDate);

      if (membersWithBirthDate.length === 0) return null;

      const totalAge = membersWithBirthDate.reduce((sum, m) => {
        const birthYear = parseInt(m.user.birthDate!.substring(0, 4));
        const currentYear = new Date().getFullYear();
        return sum + (currentYear - birthYear);
      }, 0);

      return Math.round(totalAge / membersWithBirthDate.length);
    };

    const calculateAverageHeight = (members: typeof approvedMembers) => {
      const membersWithHeight = members.filter((m) => m.user.height);

      if (membersWithHeight.length === 0) return null;

      const totalHeight = membersWithHeight.reduce(
        (sum, m) => sum + m.user.height!,
        0
      );

      return Math.round(totalHeight / membersWithHeight.length);
    };

    const countBySkillLevel = (
      members: typeof approvedMembers,
      level: string
    ) => members.filter((m) => m.user.skillLevel === level).length;

    const countByPlayerBackground = (
      members: typeof approvedMembers,
      background: string
    ) => members.filter((m) => m.user.playerBackground === background).length;

    // 실시간 통계 계산
    const stats = {
      beginnerCount: countBySkillLevel(approvedMembers, "BEGINNER"),
      amateurCount: countBySkillLevel(approvedMembers, "AMATEUR"),
      aceCount: countBySkillLevel(approvedMembers, "ACE"),
      semiproCount: countBySkillLevel(approvedMembers, "SEMIPRO"),
      professionalCount: countByPlayerBackground(
        approvedMembers,
        "PROFESSIONAL"
      ),
      averageAge: calculateAverageAge(approvedMembers),
      averageHeight: calculateAverageHeight(approvedMembers),
    };

    return {
      success: true,
      data: {
        ...team,
        members: approvedMembers, // 승인된 멤버들만 반환
        stats,
        currentUserMembership, // 현재 사용자의 멤버십 정보 추가
      },
    };
  } catch (error) {
    console.error("팀 데이터 조회 실패:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다",
      data: null,
    };
  }
}
