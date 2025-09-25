"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Prisma, TeamMemberRole, TeamMemberStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface UserMembershipInfo {
  isMember: boolean;
  role: TeamMemberRole | null;
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
                gender: true,
                condition: true,
              },
            },
          },
        },
        followers: true,
        // 일정 및 경기 관련 데이터 추가
        hostedSchedules: {
          include: {
            matches: {
              include: {
                lineups: true,
              },
            },
          },
        },
        invitedSchedules: {
          include: {
            matches: {
              include: {
                lineups: true,
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

    // 승인된 멤버들만 필터링
    const pendingMembers = team.members.filter(
      (member) => member.status === "PENDING"
    );

    // 현재 사용자의 멤버십 정보 확인
    const currentUserMembership: UserMembershipInfo = session?.user?.id
      ? (() => {
          const userMember = team.members.find(
            (member) => member.user.id === session.user.id
          );

          return {
            isMember: !!userMember,
            role: userMember?.role || null,
            status: userMember?.status || null,
            joinedAt: userMember?.createdAt || null,
          };
        })()
      : {
          isMember: false,
          role: null,
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

      return Math.round((totalAge / membersWithBirthDate.length) * 10) / 10;
    };

    const calculateAverageHeight = (members: typeof approvedMembers) => {
      const membersWithHeight = members.filter((m) => m.user.height);

      if (membersWithHeight.length === 0) return null;

      const totalHeight = membersWithHeight.reduce(
        (sum, m) => sum + m.user.height!,
        0
      );

      return Math.round((totalHeight / membersWithHeight.length) * 10) / 10;
    };

    const countBySkillLevel = (
      members: typeof approvedMembers,
      level: string
    ) => members.filter((m) => m.user.skillLevel === level).length;

    const countByPlayerBackground = (
      members: typeof approvedMembers,
      background: string
    ) => members.filter((m) => m.user.playerBackground === background).length;

    // 일정 관련 통계 계산
    const calculateScheduleStats = () => {
      // 호스트로 진행한 일정과 초대받은 일정을 합침 (PENDING, REJECTED 제외)
      const allSchedules = [
        ...team.hostedSchedules.filter(
          (schedule) =>
            schedule.status !== "PENDING" && schedule.status !== "REJECTED"
        ),
        ...team.invitedSchedules.filter(
          (schedule) =>
            schedule.status !== "PENDING" && schedule.status !== "REJECTED"
        ),
      ];

      // Match가 있는 모든 경기들 (lineup이 있는 것만)
      const allMatches = allSchedules.flatMap((schedule) =>
        schedule.matches.filter(
          (match) => match.lineups.length > 0 && match.isLinedUp
        )
      );

      // 일정 수: Match가 있는 Schedule들만 (lineup이 있는 match가 있어야 함)
      const totalSchedules = allSchedules.filter((schedule) =>
        schedule.matches.some(
          (match) => match.lineups.length > 0 && match.isLinedUp
        )
      ).length;

      // 경기 수: lineup이 있는 Match들의 개수
      const totalMatches = allMatches.length;

      // 자체전 수: matchType이 SQUAD이고 lineup이 있는 match가 있는 schedule
      const selfMatches = allSchedules.filter(
        (schedule) =>
          schedule.matchType === "SQUAD" &&
          schedule.matches.some(
            (match) => match.lineups.length > 0 && match.isLinedUp
          )
      ).length;

      // 친선전 수: matchType이 TEAM이고 lineup이 있는 match가 있는 schedule
      const friendlyMatches = allSchedules.filter(
        (schedule) =>
          schedule.matchType === "TEAM" &&
          schedule.matches.some(
            (match) => match.lineups.length > 0 && match.isLinedUp
          )
      ).length;

      return {
        totalSchedules,
        totalMatches,
        selfMatches,
        friendlyMatches,
      };
    };

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
      // 일정 통계 추가
      scheduleStats: calculateScheduleStats(),
    };

    return {
      success: true,
      data: {
        ...team,
        members: {
          approved: approvedMembers,
          pending: pendingMembers,
        },
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

export async function cancelJoinTeam(teamId: string) {
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

    // 2. 현재 사용자의 팀 멤버십 확인
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: session.user.id,
        },
      },
    });

    if (!existingMember) {
      return {
        success: false,
        error: "가입 신청 내역이 없습니다",
        data: null,
      };
    }

    // 3. 상태별 처리
    switch (existingMember.status) {
      case "PENDING":
        // PENDING 상태인 경우만 취소 가능
        break;
      case "APPROVED":
        return {
          success: false,
          error:
            "이미 승인된 멤버는 가입 신청을 취소할 수 없습니다. 팀 탈퇴를 이용해주세요",
          data: null,
        };
      case "REJECTED":
        return {
          success: false,
          error: "이미 거절된 가입 신청입니다",
          data: null,
        };
      case "LEAVE":
        return {
          success: false,
          error: "이미 팀을 떠난 상태입니다",
          data: null,
        };
      default:
        return {
          success: false,
          error: "알 수 없는 상태입니다",
          data: null,
        };
    }

    // 4. 가입 신청 취소 (레코드 삭제)
    const cancelledMember = await prisma.teamMember.delete({
      where: { id: existingMember.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
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
      message: "가입 신청이 취소되었습니다",
      data: cancelledMember,
    };
  } catch (error) {
    console.error("가입 신청 취소 실패:", error);

    // Prisma 에러 타입별 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025": // Record not found
          return {
            success: false,
            error: "가입 신청 내역을 찾을 수 없습니다",
            data: null,
          };
        case "P2003": // Foreign key constraint violation
          return {
            success: false,
            error: "유효하지 않은 요청입니다",
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

// 추가: 팀 탈퇴 함수 (승인된 멤버용)
export async function leaveTeam(teamId: string) {
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
      select: {
        hasFormerPro: true,
      },
    });

    if (!existingTeam) {
      return {
        success: false,
        error: "존재하지 않는 팀입니다",
        data: null,
      };
    }

    // 2. 현재 사용자의 팀 멤버십 확인
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: session.user.id,
        },
      },
    });

    if (!existingMember) {
      return {
        success: false,
        error: "팀 멤버가 아닙니다",
        data: null,
      };
    }

    // 3. 상태 확인
    if (existingMember.status !== "APPROVED") {
      return {
        success: false,
        error: "승인된 멤버만 팀을 탈퇴할 수 있습니다",
        data: null,
      };
    }

    // 4. 팀 오너인지 확인 (오너는 탈퇴 불가)
    if (existingMember.role === "OWNER") {
      return {
        success: false,
        error:
          "팀 오너는 팀을 탈퇴할 수 없습니다. 팀을 삭제하거나 오너 권한을 이양해주세요",
        data: null,
      };
    }

    // 5. 팀 탈퇴 처리 (상태를 LEAVE로 변경)
    const leftMember = await prisma.teamMember.update({
      where: { id: existingMember.id },
      data: {
        status: "LEAVE",
        joinedAt: null, // 탈퇴 시 가입일 초기화
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
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

    // 2. 현재 사용자의 팀 멤버십 확인
    const currentMembers = await prisma.teamMember.findMany({
      where: {
        teamId,
        status: "APPROVED",
      },
      select: {
        id: true,
        user: {
          select: {
            playerBackground: true,
          },
        },
      },
    });

    const hasFormerPro = currentMembers.some(
      (member) => member.user.playerBackground === "PROFESSIONAL"
    );

    await prisma.team.update({
      where: { id: teamId },
      data: {
        hasFormerPro,
      },
    });

    revalidatePath(`/teams/${teamId}`);

    return {
      success: true,
      message: "팀에서 탈퇴했습니다",
      data: leftMember,
    };
  } catch (error) {
    console.error("팀 탈퇴 실패:", error);

    // Prisma 에러 타입별 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025": // Record not found
          return {
            success: false,
            error: "멤버 정보를 찾을 수 없습니다",
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

export async function approveTeamMember(teamId: string, targetUserId: string) {
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
      select: {
        hasFormerPro: true,
      },
    });

    if (!existingTeam) {
      return {
        success: false,
        error: "존재하지 않는 팀입니다",
        data: null,
      };
    }

    // 2. 현재 사용자가 팀의 관리자인지 확인
    const currentUserMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: session.user.id,
        },
      },
    });

    if (!currentUserMember) {
      return {
        success: false,
        error: "팀 멤버가 아닙니다",
        data: null,
      };
    }

    if (
      currentUserMember.role !== "OWNER" &&
      currentUserMember.role !== "MANAGER"
    ) {
      return {
        success: false,
        error:
          "가입 승인 권한이 없습니다. 팀 오너 또는 관리자만 승인할 수 있습니다",
        data: null,
      };
    }

    if (currentUserMember.status !== "APPROVED") {
      return {
        success: false,
        error: "승인된 멤버만 다른 멤버를 승인할 수 있습니다",
        data: null,
      };
    }

    // 3. 승인할 대상 멤버 확인
    const targetMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
            playerBackground: true,
          },
        },
      },
    });

    if (!targetMember) {
      return {
        success: false,
        error: "승인할 가입 신청을 찾을 수 없습니다",
        data: null,
      };
    }

    // 4. 상태별 처리
    switch (targetMember.status) {
      case "PENDING":
        // PENDING 상태인 경우만 승인 가능
        break;
      case "APPROVED":
        return {
          success: false,
          error: "이미 승인된 멤버입니다",
          data: null,
        };
      case "REJECTED":
        return {
          success: false,
          error: "거절된 가입 신청입니다. 사용자가 다시 가입 신청해야 합니다",
          data: null,
        };
      case "LEAVE":
        return {
          success: false,
          error: "팀을 떠난 사용자입니다. 사용자가 다시 가입 신청해야 합니다",
          data: null,
        };
      default:
        return {
          success: false,
          error: "알 수 없는 상태입니다",
          data: null,
        };
    }

    // 5. 가입 승인 처리
    const approvedMember = await prisma.teamMember.update({
      where: { id: targetMember.id },
      data: {
        status: "APPROVED",
        joinedAt: new Date(), // 실제 승인된 날짜 기록
      },
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

    if (targetMember.user.playerBackground === "PROFESSIONAL") {
      await prisma.team.update({
        where: { id: teamId },
        data: {
          hasFormerPro: true,
        },
      });
    }

    revalidatePath(`/teams/${teamId}`);
    revalidatePath(`/teams`);

    return {
      success: true,
      message: `${
        approvedMember.user.nickname || approvedMember.user.name
      }님의 가입을 승인했습니다`,
      data: approvedMember,
    };
  } catch (error) {
    console.error("가입 승인 실패:", error);

    // Prisma 에러 타입별 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025": // Record not found
          return {
            success: false,
            error: "승인할 멤버를 찾을 수 없습니다",
            data: null,
          };
        case "P2003": // Foreign key constraint violation
          return {
            success: false,
            error: "유효하지 않은 요청입니다",
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

// 추가: 가입 거절 함수
export async function rejectTeamMember(
  teamId: string,
  targetUserId: string,
  reason?: string
) {
  const session = await auth();
  console.log(reason, "reason");

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

    // 2. 현재 사용자가 팀의 관리자인지 확인
    const currentUserMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: session.user.id,
        },
      },
    });

    if (
      !currentUserMember ||
      (currentUserMember.role !== "OWNER" &&
        currentUserMember.role !== "MANAGER") ||
      currentUserMember.status !== "APPROVED"
    ) {
      return {
        success: false,
        error: "가입 거절 권한이 없습니다",
        data: null,
      };
    }

    // 3. 거절할 대상 멤버 확인
    const targetMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    });

    if (!targetMember || targetMember.status !== "PENDING") {
      return {
        success: false,
        error: "거절할 수 있는 가입 신청이 없습니다",
        data: null,
      };
    }

    // 4. 가입 거절 처리
    const rejectedMember = await prisma.teamMember.update({
      where: { id: targetMember.id },
      data: {
        status: "REJECTED",
        // 거절 사유가 있다면 메모 필드에 저장 (스키마에 memo 필드가 있다면)
        // memo: reason,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
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
      message: `${
        rejectedMember.user.nickname || rejectedMember.user.name
      }님의 가입을 거절했습니다`,
      data: rejectedMember,
    };
  } catch (error) {
    console.error("가입 거절 실패:", error);

    return {
      success: false,
      error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요",
      data: null,
    };
  }
}
