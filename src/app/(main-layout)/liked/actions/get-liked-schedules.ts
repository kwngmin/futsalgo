"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function getLikedSchedules() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      success: false,
      error: "로그인이 필요합니다",
    };
  }
  try {
    // 유저가 좋아요한 ScheduleLike를 가져오고, 그 안의 Schedule 포함
    const likedSchedules = await prisma.scheduleLike.findMany({
      where: {
        userId,
      },
      include: {
        schedule: {
          include: {
            hostTeam: true,
            invitedTeam: true,
            attendances: true,
            createdBy: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // schedule 정보만 추출
    const schedules = likedSchedules.map((like) => like.schedule);

    // 2. 사용자 + 소속 팀 정보 조회
    const player = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        teams: {
          where: {
            status: "APPROVED", // 승인된 팀만
          },
          include: {
            team: true,
          },
        },
      },
    });

    if (!player) {
      return {
        success: false,
        error: "사용자를 찾을 수 없습니다",
      };
    }

    // 4. 그중 OWNER 또는 MANAGER 권한이 있는 팀
    const manageableTeams = player.teams
      .filter((t) => t.role === "OWNER" || t.role === "MANAGER")
      .map((t) => t.team);

    return {
      success: true,
      data: {
        likedSchedules: schedules,
        manageableTeams,
      },
    };
  } catch (error) {
    console.error("일정 목록 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
