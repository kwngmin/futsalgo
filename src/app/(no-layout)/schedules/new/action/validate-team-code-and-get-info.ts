"use server";

import { prisma } from "@/shared/lib/prisma";
import { TeamMemberStatus } from "@prisma/client";

// 팀 정보 타입
interface TeamInfo {
  id: string;
  name: string;
  code: string;
  city: string;
  district: string;
  logoUrl?: string;
  level: string;
  gender: string;
}

// 통합된 응답 타입
interface TeamValidationResult {
  success: boolean;
  isValid: boolean;
  team?: TeamInfo;
  error?: string;
  duplicateMembers?: string[]; // 중복 멤버 닉네임 리스트
}

// 중복 멤버 에러 메시지 생성 함수
function createDuplicateMemberMessage(memberNames: string[]): string {
  const count = memberNames.length;

  if (count === 0) return "";

  // 1명인 경우
  if (count === 1) {
    return `${memberNames[0]}님이 양쪽 팀에 소속되어 있어 일정을 만들 수 없습니다`;
  }

  // 2-3명인 경우 - 모든 이름 표시
  if (count <= 3) {
    const lastMember = memberNames[count - 1];
    const otherMembers = memberNames.slice(0, -1).join(", ");
    return `${otherMembers}, ${lastMember}님이 양쪽 팀에 소속되어 있어 매치를 신청할 수 없습니다`;
  }

  // 4명 이상인 경우 - 일부만 표시
  const displayedMembers = memberNames.slice(0, 2).join(", ");
  const remainingCount = count - 2;
  return `${displayedMembers} 외 ${remainingCount}명이 양쪽 팀에 소속되어 있어 매치를 신청할 수 없습니다`;
}

// 팀 코드 검증 및 팀 정보 조회를 한 번에 처리
export async function validateTeamCodeAndGetInfo(
  teamCode: string,
  hostTeamId?: string // 주최팀 ID 추가
): Promise<TeamValidationResult> {
  try {
    // 입력값 검증
    if (!teamCode || typeof teamCode !== "string") {
      return {
        success: true,
        isValid: false,
        error: "팀 코드가 필요합니다",
      };
    }

    const trimmedCode = teamCode.trim();

    // 팀 코드 형식 검증 (6자리 숫자)
    if (!/^\d{6}$/.test(trimmedCode)) {
      return {
        success: true,
        isValid: false,
        error: "팀 코드는 6자리 숫자여야 합니다",
      };
    }

    // 데이터베이스에서 팀 조회
    const team = await prisma.team.findUnique({
      where: { code: trimmedCode },
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        district: true,
        logoUrl: true,
        level: true,
        gender: true,
        status: true,
      },
    });

    // 팀이 존재하지 않는 경우
    if (!team) {
      return {
        success: true,
        isValid: false,
        error: "존재하지 않는 팀 코드입니다",
      };
    }

    // 팀이 비활성화된 경우
    if (team.status !== "ACTIVE") {
      return {
        success: true,
        isValid: false,
        error: "비활성화된 팀입니다",
      };
    }

    // 주최팀과 초청팀이 같은 경우 체크
    if (hostTeamId && team.id === hostTeamId) {
      return {
        success: true,
        isValid: false,
        error: "주최팀과 초청팀이 같을 수 없습니다",
      };
    }

    // 중복 멤버 체크 (hostTeamId가 있는 경우에만)
    if (hostTeamId) {
      const duplicateCheck = await checkDuplicateMembers(hostTeamId, team.id);

      if (duplicateCheck.hasDuplicates) {
        return {
          success: true,
          isValid: false,
          error: createDuplicateMemberMessage(duplicateCheck.memberNicknames),
          duplicateMembers: duplicateCheck.memberNicknames,
        };
      }
    }

    // 성공적으로 유효한 팀 발견
    return {
      success: true,
      isValid: true,
      team: {
        id: team.id,
        name: team.name,
        code: team.code,
        city: team.city,
        district: team.district,
        logoUrl: team.logoUrl || undefined,
        level: team.level,
        gender: team.gender,
      },
    };
  } catch (error) {
    console.error("팀 코드 검증 오류:", error);
    return {
      success: false,
      isValid: false,
      error: "서버 오류가 발생했습니다",
    };
  }
}

// 중복 멤버 체크 함수
async function checkDuplicateMembers(
  hostTeamId: string,
  invitedTeamId: string
): Promise<{ hasDuplicates: boolean; memberNicknames: string[] }> {
  try {
    // 두 팀의 활성 멤버 조회
    const [hostTeamMembers, invitedTeamMembers] = await Promise.all([
      prisma.teamMember.findMany({
        where: {
          teamId: hostTeamId,
          status: TeamMemberStatus.APPROVED,
          banned: false,
        },
        select: {
          userId: true,
          user: {
            select: {
              nickname: true,
            },
          },
        },
      }),
      prisma.teamMember.findMany({
        where: {
          teamId: invitedTeamId,
          status: TeamMemberStatus.APPROVED,
          banned: false,
        },
        select: {
          userId: true,
          user: {
            select: {
              nickname: true,
            },
          },
        },
      }),
    ]);

    // userId 기준으로 중복 멤버 찾기
    const hostUserIds = new Set(hostTeamMembers.map((m) => m.userId));
    const duplicateMembers = invitedTeamMembers.filter((m) =>
      hostUserIds.has(m.userId)
    );

    if (duplicateMembers.length > 0) {
      // 이름 순으로 정렬 (일관된 표시를 위해)
      const memberNicknames = duplicateMembers
        .map((m) => m.user.nickname)
        .filter((nickname): nickname is string => nickname !== null)
        .sort(); // 가나다 순 정렬

      return {
        hasDuplicates: true,
        memberNicknames,
      };
    }

    return {
      hasDuplicates: false,
      memberNicknames: [],
    };
  } catch (error) {
    console.error("중복 멤버 체크 오류:", error);
    // 에러 발생 시 안전하게 처리 (매치 생성 허용하지 않음)
    throw error;
  }
}
