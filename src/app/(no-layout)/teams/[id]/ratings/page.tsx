// app/teams/[teamId]/ratings/[userId]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { auth } from "@/shared/lib/auth";
import TeamMemberRatingList from "./ui/TeamMemberRatingList";

/**
 * 팀 멤버들과 평가 정보를 가져오는 함수
 * @param teamId - 팀 ID
 * @param currentUserId - 현재 사용자 ID
 * @returns 팀 멤버들과 평가 정보, 또는 null (권한이 없는 경우)
 */
async function getTeamMembers(teamId: string, currentUserId: string) {
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
    const currentMonth = now.getMonth() + 1;

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
          periodMonth: currentMonth,
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

export default async function TeamRatingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const data = await getTeamMembers(id, session.user.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {data.team?.name} 팀원 평가
        </h1>
        <p className="text-gray-600 mt-2">
          팀원들의 실력을 평가해주세요. 한 달에 한 번만 평가할 수 있습니다.
        </p>
      </div>

      <Suspense fallback={<div>로딩 중...</div>}>
        <TeamMemberRatingList
          members={data.members}
          teamId={id}
          currentUserId={session.user.id}
        />
      </Suspense>
    </div>
  );
}
