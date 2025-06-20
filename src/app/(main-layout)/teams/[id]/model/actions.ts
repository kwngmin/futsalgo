"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Prisma, TeamMemberStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

export async function joinTeam(teamId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "로그인이 필요합니다",
      data: null,
    };
  }

  try {
    // 1. 팀이 존재하는지 확인
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam) {
      return {
        success: false,
        error: "존재하지 않는 팀입니다",
        data: null,
      };
    }

    // 2. 이미 가입 신청했거나 멤버인지 확인
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: session.user.id,
        },
      },
    });

    if (existingMember) {
      const statusMessages = {
        PENDING: "이미 가입 신청을 했습니다. 승인을 기다려주세요",
        APPROVED: "이미 팀 멤버입니다",
        REJECTED: "가입이 거절되었습니다. 팀 관리자에게 문의하세요",
        LEAVE: "이전에 팀을 떠났습니다. 다시 가입하시겠습니까?",
      } as const;

      // LEAVE 상태인 경우 재가입 허용
      if (existingMember.status === "LEAVE") {
        const rejoinedMember = await prisma.teamMember.update({
          where: { id: existingMember.id },
          data: {
            status: "PENDING",
            createdAt: new Date(), // 재가입 시간 업데이트
            joinedAt: null, // 재승인 대기 상태로 초기화
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                nickname: true,
                image: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        revalidatePath(`/teams/${teamId}`);

        return {
          success: true,
          message: "팀 재가입 신청이 완료되었습니다",
          data: rejoinedMember,
        };
      }

      return {
        success: false,
        error: statusMessages[existingMember.status] || "알 수 없는 상태입니다",
        data: null,
      };
    }

    // 3. 새로운 팀 멤버 생성
    const newTeamMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: session.user.id,
        status: "PENDING",
        role: "MEMBER",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath(`/teams/${teamId}`);

    return {
      success: true,
      message: "팀 가입 신청이 완료되었습니다",
      data: newTeamMember,
    };
  } catch (error) {
    console.error("팀 가입 실패:", error);

    // Prisma 에러 타입별 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002": // Unique constraint violation
          return {
            success: false,
            error: "이미 가입 신청을 했습니다",
            data: null,
          };
        case "P2003": // Foreign key constraint violation
          return {
            success: false,
            error: "유효하지 않은 팀 또는 사용자 정보입니다",
            data: null,
          };
        case "P2025": // Record not found
          return {
            success: false,
            error: "팀을 찾을 수 없습니다",
            data: null,
          };
        default:
          console.error("알 수 없는 Prisma 에러:", error);
      }
    }

    return {
      success: false,
      error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요",
      data: null,
    };
  }
}
