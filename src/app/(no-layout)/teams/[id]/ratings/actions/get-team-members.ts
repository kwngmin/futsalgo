"use server";

import { prisma } from "@/shared/lib/prisma";

/**
 * 팀 멤버들과 평가 정보를 가져오는 함수
 * @param teamId - 팀 ID
 * @param currentUserId - 현재 사용자 ID
 * @returns 팀 멤버들과 평가 정보, 또는 null (권한이 없는 경우)
 */
export async function getTeamMembers(teamId: string, currentUserId: string) {
  if (!teamId || !currentUserId) {
    return null;
  }

  try {
    // 팀 정보와 현재 유저의 멤버십을 동시에 확인
    const [team, currentUserMember] = await Promise.all([
      prisma.team.findUnique({
        where: { id: teamId },
        select: { id: true, name: true },
      }),
      prisma.teamMember.findFirst({
        where: {
          teamId,
          userId: currentUserId,
          status: "APPROVED",
        },
      }),
    ]);

    if (!team || !currentUserMember) {
      return null;
    }

    // 현재 년월 계산
    const now = new Date();
    const currentYear = now.getFullYear();
    // const currentMonth = now.getMonth() + 1;

    // 팀의 승인된 멤버들과 현재 유저의 평가 정보를 병렬로 가져오기
    const [members, myRatings] = await Promise.all([
      prisma.teamMember.findMany({
        where: {
          teamId,
          status: "APPROVED",
          userId: { not: currentUserId }, // 자기 자신 제외
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
        },
      }),
      prisma.teamMemberRating.findMany({
        where: {
          teamId,
          fromUserId: currentUserId,
          periodYear: currentYear,
          //   periodMonth: currentMonth,
        },
      }),
    ]);

    // 멤버 정보와 평가 정보 결합
    const membersWithRatings = members.map((member) => {
      const rating = myRatings.find((r) => r.toUserId === member.userId);
      return {
        ...member,
        hasRated: !!rating,
        ratedAt: rating?.createdAt || null,
        currentRating: rating || null,
      };
    });

    return {
      members: membersWithRatings,
      team,
    };
  } catch (error) {
    console.error("팀 멤버 정보 조회 중 오류:", error);
    return null;
  }
}
