"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { TeamSide } from "@prisma/client";

export async function addMatch(scheduleId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 스케줄과 참석자 정보를 한 번에 조회 (성능 최적화)
    const scheduleWithAttendances = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        hostTeamId: true,
        invitedTeamId: true,
        matchType: true,
        attendances: {
          where: {
            attendanceStatus: "ATTENDING",
          },
          select: {
            userId: true,
            teamType: true,
          },
        },
      },
    });

    if (!scheduleWithAttendances) {
      return { success: false, error: "스케줄을 찾을 수 없습니다" };
    }

    const { hostTeamId, invitedTeamId, matchType, attendances } =
      scheduleWithAttendances;

    // TEAM 매치타입일 때 초대팀 검증
    if (matchType === "TEAM" && !invitedTeamId) {
      return { success: false, error: "초대된 팀이 없습니다" };
    }

    // 참석자 중에 현재 사용자가 있는지 확인
    // const userAttendance = attendances.find(
    //   (attendance) => attendance.userId === userId
    // );
    // if (!userAttendance) {
    //   return { success: false, error: "참석자가 아닙니다" };
    // }

    // awayTeamId 결정 로직 개선
    const awayTeamId = matchType === "TEAM" ? invitedTeamId! : hostTeamId;

    // 트랜잭션으로 매치 생성과 라인업 추가를 원자적으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 매치 생성
      const match = await tx.match.create({
        data: {
          scheduleId,
          createdById: userId,
          homeTeamId: hostTeamId,
          awayTeamId,
        },
      });

      // 라인업 데이터 준비
      const lineupData = attendances.map((attendance) => {
        let side: TeamSide | undefined;

        if (matchType === "TEAM") {
          side = attendance.teamType === "HOST" ? "HOME" : "AWAY";
        }
        // SQUAD 타입일 때는 side를 undefined로 두어 기본값(UNDECIDED) 사용

        return {
          matchId: match.id,
          userId: attendance.userId,
          ...(side && { side }), // side가 있을 때만 포함
        };
      });

      // 라인업 일괄 생성
      if (lineupData.length > 0) {
        await tx.lineup.createMany({
          data: lineupData,
        });
      }

      return match;
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("매치 생성 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
