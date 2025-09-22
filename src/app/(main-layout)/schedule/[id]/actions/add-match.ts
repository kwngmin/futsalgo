"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { TeamSide, ScheduleStatus, MatchType } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

// 타입 정의
type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * 스케줄 상태를 확인하고 업데이트하는 헬퍼 함수
 * CONFIRMED: 일정 확정, 경기 없음
 * READY: 경기 있으나 모두 isLinedUp false
 * PLAY: 경기 있고 최소 1개 isLinedUp true
 */
async function updateScheduleStatusForNewMatch(
  scheduleId: string,
  matchType: MatchType,
  isLinedUp: boolean,
  tx: TransactionClient
) {
  const schedule = await tx.schedule.findUnique({
    where: { id: scheduleId },
    select: { status: true },
  });

  if (!schedule) return;

  // PENDING, REJECTED, DELETED 상태는 변경하지 않음
  if (
    schedule.status === ScheduleStatus.PENDING ||
    schedule.status === ScheduleStatus.REJECTED ||
    schedule.status === ScheduleStatus.DELETED
  ) {
    return;
  }

  let targetStatus: ScheduleStatus | null = null;

  // 자체전: CONFIRMED → READY (경기 생성 시)
  if (matchType === MatchType.SQUAD) {
    if (schedule.status === ScheduleStatus.CONFIRMED) {
      targetStatus = ScheduleStatus.READY;
    }
  }
  // 친선전: 참석자 유무에 따라 READY 또는 PLAY로
  else if (matchType === MatchType.TEAM) {
    if (schedule.status === ScheduleStatus.CONFIRMED) {
      // 양팀 모두 참석자가 있으면 PLAY, 없으면 READY
      targetStatus = isLinedUp ? ScheduleStatus.PLAY : ScheduleStatus.READY;
    } else if (schedule.status === ScheduleStatus.READY && isLinedUp) {
      // READY 상태에서 라인업이 완성되면 PLAY로
      targetStatus = ScheduleStatus.PLAY;
    }
  }

  // 상태 업데이트가 필요한 경우에만 실행
  if (targetStatus && schedule.status !== targetStatus) {
    await tx.schedule.update({
      where: { id: scheduleId },
      data: { status: targetStatus },
    });
  }
}

/**
 * 경기 추가
 */
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
        status: true,
        attendances: {
          where: {
            attendanceStatus: "ATTENDING",
          },
          select: {
            userId: true,
            teamType: true,
          },
        },
        hostTeamMercenaryCount: true,
        invitedTeamMercenaryCount: true,
      },
    });

    if (!scheduleWithAttendances) {
      return { success: false, error: "스케줄을 찾을 수 없습니다" };
    }

    const {
      hostTeamId,
      invitedTeamId,
      matchType,
      attendances,
      hostTeamMercenaryCount,
      invitedTeamMercenaryCount,
    } = scheduleWithAttendances;

    // 친선전일 때 초대팀 검증
    if (matchType === MatchType.TEAM && !invitedTeamId) {
      return { success: false, error: "초대된 팀이 없습니다" };
    }

    // awayTeamId 결정
    const awayTeamId =
      matchType === MatchType.TEAM ? invitedTeamId! : hostTeamId;

    // 팀별 참석자 분류
    const homeTeamAttendances = attendances.filter(
      (attendance) => attendance.teamType === "HOST"
    );

    const awayTeamAttendances = attendances.filter(
      (attendance) => attendance.teamType === "INVITED"
    );

    // isLinedUp 결정
    // 자체전: false (라인업 배정 전)
    // 친선전: 양팀 모두 참석자가 있으면 true
    const isLinedUp =
      matchType === MatchType.SQUAD
        ? false
        : homeTeamAttendances.length > 0 && awayTeamAttendances.length > 0;

    // 트랜잭션으로 매치 생성과 라인업 추가를 원자적으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 매치 생성
      const match = await tx.match.create({
        data: {
          scheduleId,
          createdById: userId,
          homeTeamId: hostTeamId,
          awayTeamId,
          isLinedUp,
          // 자체전: undecided에 모든 용병 배치
          undecidedTeamMercenaryCount:
            matchType === MatchType.SQUAD ? hostTeamMercenaryCount : 0,
          // 친선전: 각 팀에 용병 배치
          homeTeamMercenaryCount:
            matchType === MatchType.TEAM ? hostTeamMercenaryCount : 0,
          awayTeamMercenaryCount:
            matchType === MatchType.TEAM ? invitedTeamMercenaryCount || 0 : 0,
        },
      });

      // 라인업 데이터 준비
      const lineupData = attendances.map((attendance) => {
        // 친선전: 팀별로 자동 사이드 배정
        // 자체전: UNDECIDED (기본값)
        const side: TeamSide | undefined =
          matchType === MatchType.TEAM
            ? attendance.teamType === "HOST"
              ? "HOME"
              : "AWAY"
            : undefined;

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

      // 스케줄 상태 업데이트
      await updateScheduleStatusForNewMatch(
        scheduleId,
        matchType,
        isLinedUp,
        tx
      );

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
