"use server";

import { prisma } from "@/shared/lib/prisma";
import {
  TeamSide,
  MatchType,
  AttendanceStatus,
  ScheduleStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { PrismaClient } from "@prisma/client";

// 타입 정의
type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * 스케줄 상태를 확인하고 업데이트하는 통합 헬퍼 함수
 * CONFIRMED: 일정 확정, 경기 없음
 * READY: 경기 있으나 모두 isLinedUp false
 * PLAY: 경기 있고 최소 1개 isLinedUp true
 */
export async function updateScheduleStatusBasedOnMatches(
  scheduleId: string,
  tx: TransactionClient
) {
  // 스케줄과 모든 매치 정보 조회
  const schedule = await tx.schedule.findUnique({
    where: { id: scheduleId },
    select: {
      status: true,
      matchType: true,
    },
  });

  if (!schedule) return;

  // PENDING이나 REJECTED 상태는 변경하지 않음
  if (
    schedule.status === ScheduleStatus.PENDING ||
    schedule.status === ScheduleStatus.REJECTED ||
    schedule.status === ScheduleStatus.DELETED
  ) {
    return;
  }

  // 스케줄의 모든 매치들 조회
  const matches = await tx.match.findMany({
    where: { scheduleId },
    select: { isLinedUp: true },
  });

  let targetStatus: ScheduleStatus;

  if (matches.length === 0) {
    // 경기가 없으면 CONFIRMED 상태로
    targetStatus = ScheduleStatus.CONFIRMED;
  } else {
    // 경기가 있는 경우, isLinedUp 상태 확인
    const hasLinedUpMatch = matches.some((match) => match.isLinedUp);

    if (hasLinedUpMatch) {
      // 최소 1개의 경기가 isLinedUp true면 PLAY
      targetStatus = ScheduleStatus.PLAY;
    } else {
      // 모든 경기가 isLinedUp false면 READY
      targetStatus = ScheduleStatus.READY;
    }
  }

  // 상태가 다를 때만 업데이트
  if (schedule.status !== targetStatus) {
    await tx.schedule.update({
      where: { id: scheduleId },
      data: { status: targetStatus },
    });
  }
}

/**
 * 라인업 상태를 확인하는 헬퍼 함수
 */
const checkLineupStatus = (lineups: Array<{ side: TeamSide }>) => {
  const homeCount = lineups.filter((lineup) => lineup.side === "HOME").length;
  const awayCount = lineups.filter((lineup) => lineup.side === "AWAY").length;
  return {
    homeCount,
    awayCount,
    isLinedUp: homeCount > 0 && awayCount > 0,
  };
};

/**
 * 팀 타입을 팀 사이드로 매핑하는 헬퍼 함수
 */
const mapTeamTypeToSide = (teamType: string): TeamSide => {
  return teamType === "HOST" ? "HOME" : "AWAY";
};

/**
 * 경기 삭제
 */
export async function deleteMatch(matchId: string, scheduleId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 매치 삭제 (연관된 라인업, 골 기록은 onDelete: Cascade로 자동 삭제)
      await tx.match.delete({
        where: { id: matchId },
      });

      // 스케줄 상태 업데이트
      await updateScheduleStatusBasedOnMatches(scheduleId, tx);
    });

    revalidatePath(`/schedules/${scheduleId}`);
    return { success: true, message: "경기가 삭제되었습니다" };
  } catch (error) {
    console.error("경기 삭제 실패:", error);
    return { success: false, error: "경기 삭제에 실패했습니다" };
  }
}

/**
 * 자체전 명단 업데이트: 참석자 중 라인업에 없는 인원을 추가
 */
export async function updateSquadLineup(matchId: string) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        schedule: {
          include: {
            attendances: {
              where: {
                attendanceStatus: AttendanceStatus.ATTENDING,
              },
              include: {
                user: true,
              },
            },
          },
        },
        lineups: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!match) {
      return { success: false, error: "매치를 찾을 수 없습니다" };
    }

    if (match.schedule.matchType !== MatchType.SQUAD) {
      return { success: false, error: "자체전이 아닙니다" };
    }

    // 현재 라인업에 있는 사용자 ID들
    const currentLineupUserIds = new Set(
      match.lineups.map((lineup) => lineup.userId)
    );

    // 참석자 중 라인업에 없는 사용자들
    const missingAttendees = match.schedule.attendances.filter(
      (attendance) => !currentLineupUserIds.has(attendance.userId)
    );

    const matchMercenaryCount =
      match.homeTeamMercenaryCount +
      match.awayTeamMercenaryCount +
      match.undecidedTeamMercenaryCount;

    const scheduleMercenaryCount = match.schedule.hostTeamMercenaryCount;

    const isUpdatedMercenaryCount =
      matchMercenaryCount !== scheduleMercenaryCount;

    if (missingAttendees.length === 0 && !isUpdatedMercenaryCount) {
      return { success: true, message: "추가할 인원이 없습니다" };
    }

    if (missingAttendees.length === 0 && isUpdatedMercenaryCount) {
      // 용병 수만 조정하는 경우
      const undecidedCount = Math.max(
        0,
        match.schedule.hostTeamMercenaryCount -
          match.homeTeamMercenaryCount -
          match.awayTeamMercenaryCount
      );

      await prisma.$transaction(async (tx) => {
        // 매치의 용병 수 업데이트
        await tx.match.update({
          where: { id: matchId },
          data: {
            homeTeamMercenaryCount: match.homeTeamMercenaryCount,
            awayTeamMercenaryCount: match.awayTeamMercenaryCount,
            undecidedTeamMercenaryCount: undecidedCount,
          },
        });

        // 스케줄 상태 업데이트
        await updateScheduleStatusBasedOnMatches(match.scheduleId, tx);
      });

      revalidatePath(`/schedules/${match.scheduleId}/match/${matchId}`);
      return { success: true, message: "용병 수가 조정되었습니다" };
    }

    // 현재 HOME과 AWAY 팀 인원 수 계산
    const lineupStatus = checkLineupStatus(match.lineups);

    // 균등 배정을 위한 카운터
    let homeCount = lineupStatus.homeCount;
    let awayCount = lineupStatus.awayCount;

    const newLineups = missingAttendees.map((attendance) => {
      let side: TeamSide;

      // 인원 수를 고려하여 균등하게 배정
      if (homeCount <= awayCount) {
        side = "HOME";
        homeCount++;
      } else {
        side = "AWAY";
        awayCount++;
      }

      return {
        matchId,
        userId: attendance.userId,
        side,
      };
    });

    // 트랜잭션으로 라인업 생성과 매치 상태 업데이트를 원자적으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 새 라인업 생성
      await tx.lineup.createMany({
        data: newLineups,
      });

      // 업데이트 후 전체 라인업 상태 확인
      const allLineups = await tx.lineup.findMany({
        where: { matchId },
        select: { side: true },
      });

      const lineupStatus = checkLineupStatus(allLineups);

      // 용병 수 재계산
      const undecidedCount = Math.max(
        0,
        match.schedule.hostTeamMercenaryCount -
          match.homeTeamMercenaryCount -
          match.awayTeamMercenaryCount
      );

      // 매치의 isLinedUp 상태와 용병 수 업데이트
      await tx.match.update({
        where: { id: matchId },
        data: {
          isLinedUp: lineupStatus.isLinedUp,
          homeTeamMercenaryCount: match.homeTeamMercenaryCount,
          awayTeamMercenaryCount: match.awayTeamMercenaryCount,
          undecidedTeamMercenaryCount: undecidedCount,
        },
      });

      // 스케줄 상태 업데이트
      await updateScheduleStatusBasedOnMatches(match.scheduleId, tx);

      return {
        lineupCount: newLineups.length,
        homeCount: lineupStatus.homeCount,
        awayCount: lineupStatus.awayCount,
        isLinedUp: lineupStatus.isLinedUp,
      };
    });

    revalidatePath(`/schedules/${match.scheduleId}/match/${matchId}`);
    return {
      success: true,
      message: `${missingAttendees.length}명의 인원이 추가되었습니다 (HOME: ${result.homeCount}명, AWAY: ${result.awayCount}명)`,
      isLinedUp: result.isLinedUp,
    };
  } catch (error) {
    console.error("자체전 명단 업데이트 실패:", error);
    return { success: false, error: "명단 업데이트에 실패했습니다" };
  }
}

/**
 * 친선전 명단 전체 업데이트: 참석자들을 팀별로 사이드 배정
 */
export async function updateTeamMatchLineup(matchId: string) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        schedule: {
          include: {
            attendances: {
              where: {
                attendanceStatus: AttendanceStatus.ATTENDING,
              },
              include: {
                user: true,
              },
            },
          },
        },
        lineups: true,
      },
    });

    if (!match) {
      return { success: false, error: "매치를 찾을 수 없습니다" };
    }

    if (match.schedule.matchType !== MatchType.TEAM) {
      return { success: false, error: "친선전이 아닙니다" };
    }

    // 새 라인업 데이터 준비
    const newLineupData = match.schedule.attendances.map((attendance) => ({
      matchId,
      userId: attendance.userId,
      side: mapTeamTypeToSide(attendance.teamType),
    }));

    const lineupStatus = checkLineupStatus(newLineupData);

    // 트랜잭션으로 모든 업데이트를 원자적으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 기존 라인업 삭제
      await tx.lineup.deleteMany({
        where: { matchId },
      });

      // 새 라인업 생성
      if (newLineupData.length > 0) {
        await tx.lineup.createMany({
          data: newLineupData,
        });
      }

      // 매치의 isLinedUp 상태 업데이트
      await tx.match.update({
        where: { id: matchId },
        data: { isLinedUp: lineupStatus.isLinedUp },
      });

      // 스케줄 상태 업데이트
      await updateScheduleStatusBasedOnMatches(match.scheduleId, tx);

      return {
        lineupCount: newLineupData.length,
        homeCount: lineupStatus.homeCount,
        awayCount: lineupStatus.awayCount,
        isLinedUp: lineupStatus.isLinedUp,
      };
    });

    revalidatePath(`/schedules/${match.scheduleId}/match/${matchId}`);

    return {
      success: true,
      message: `${result.lineupCount}명의 명단이 업데이트되었습니다`,
      data: result,
    };
  } catch (error) {
    console.error("친선전 명단 업데이트 실패:", error);
    return { success: false, error: "명단 업데이트에 실패했습니다" };
  }
}

/**
 * 친선전 명단 사이드 업데이트: 참석자들을 팀별로 사이드 배정
 */
export async function updateTeamMatchLineupSide(
  matchId: string,
  side: TeamSide
) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        schedule: {
          include: {
            attendances: {
              where: {
                attendanceStatus: AttendanceStatus.ATTENDING,
                teamType: side === "HOME" ? "HOST" : "INVITED",
              },
              include: {
                user: true,
              },
            },
          },
        },
        lineups: true,
      },
    });

    if (!match) {
      return { success: false, error: "매치를 찾을 수 없습니다" };
    }

    if (match.schedule.matchType !== MatchType.TEAM) {
      return { success: false, error: "친선전이 아닙니다" };
    }

    // 트랜잭션으로 처리하여 데이터 일관성 보장
    const result = await prisma.$transaction(async (tx) => {
      // 기존 라인업 삭제 (특정 사이드만)
      await tx.lineup.deleteMany({
        where: { matchId, side },
      });

      // 새로운 라인업 생성
      const newLineups = match.schedule.attendances.map((attendance) => ({
        matchId,
        userId: attendance.userId,
        side: mapTeamTypeToSide(attendance.teamType),
      }));

      if (newLineups.length > 0) {
        await tx.lineup.createMany({
          data: newLineups,
        });
      }

      // 업데이트 후 전체 라인업 상태 확인
      const allLineups = await tx.lineup.findMany({
        where: { matchId },
        select: { side: true },
      });

      const lineupStatus = checkLineupStatus(allLineups);

      // isLinedUp 상태 업데이트
      await tx.match.update({
        where: { id: matchId },
        data: { isLinedUp: lineupStatus.isLinedUp },
      });

      // 스케줄 상태 업데이트
      await updateScheduleStatusBasedOnMatches(match.scheduleId, tx);

      return {
        lineupsCreated: newLineups.length,
        homeCount: lineupStatus.homeCount,
        awayCount: lineupStatus.awayCount,
        isLinedUp: lineupStatus.isLinedUp,
      };
    });

    revalidatePath(`/schedules/${match.scheduleId}/match/${matchId}`);

    return {
      success: true,
      message: `${result.lineupsCreated}명의 명단이 업데이트되었습니다 (HOME: ${result.homeCount}명, AWAY: ${result.awayCount}명)`,
      isLinedUp: result.isLinedUp,
    };
  } catch (error) {
    console.error("친선전 명단 업데이트 실패:", error);
    return { success: false, error: "명단 업데이트에 실패했습니다" };
  }
}

/**
 * 친선전 복제: 팀과 라인업을 유지한 채로 새로운 경기 생성
 */
export async function duplicateTeamMatch(matchId: string) {
  try {
    const originalMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        schedule: {
          include: {
            attendances: {
              where: {
                attendanceStatus: AttendanceStatus.ATTENDING,
              },
              include: {
                user: true,
              },
            },
          },
        },
        lineups: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!originalMatch) {
      return { success: false, error: "원본 경기를 찾을 수 없습니다" };
    }

    if (originalMatch.schedule.matchType !== MatchType.TEAM) {
      return { success: false, error: "친선전만 복제할 수 있습니다" };
    }

    // 새로운 경기 생성 (라인업 포함)
    const result = await prisma.$transaction(async (tx) => {
      // 새로운 매치 생성
      const newMatch = await tx.match.create({
        data: {
          scheduleId: originalMatch.scheduleId,
          isLinedUp: originalMatch.isLinedUp,
          homeTeamMercenaryCount: originalMatch.homeTeamMercenaryCount,
          awayTeamMercenaryCount: originalMatch.awayTeamMercenaryCount,
          createdById: originalMatch.createdById,
          homeTeamId: originalMatch.homeTeamId,
          awayTeamId: originalMatch.awayTeamId,
        },
      });

      // 라인업 복제
      if (originalMatch.lineups.length > 0) {
        const newLineups = originalMatch.lineups.map((lineup) => ({
          matchId: newMatch.id,
          userId: lineup.userId,
          side: lineup.side,
        }));

        await tx.lineup.createMany({
          data: newLineups,
        });
      }

      // 스케줄 상태 업데이트
      await updateScheduleStatusBasedOnMatches(originalMatch.scheduleId, tx);

      return newMatch;
    });

    revalidatePath(`/schedules/${originalMatch.scheduleId}/match/${result.id}`);

    return {
      success: true,
      message: "새로운 경기가 생성되었습니다",
      data: { matchId: result.id },
    };
  } catch (error) {
    console.error("친선전 복제 실패:", error);
    return { success: false, error: "경기 복제에 실패했습니다" };
  }
}

/**
 * 자체전 복제: 팀과 라인업을 유지한 채로 새로운 경기 생성
 */
export async function duplicateSquadMatch(matchId: string) {
  try {
    const originalMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        schedule: {
          include: {
            attendances: {
              where: {
                attendanceStatus: AttendanceStatus.ATTENDING,
              },
              include: {
                user: true,
              },
            },
          },
        },
        lineups: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!originalMatch) {
      return { success: false, error: "원본 경기를 찾을 수 없습니다" };
    }

    if (originalMatch.schedule.matchType !== MatchType.SQUAD) {
      return { success: false, error: "자체전만 복제할 수 있습니다" };
    }

    // 새로운 경기 생성 (라인업 포함)
    const result = await prisma.$transaction(async (tx) => {
      // 새로운 매치 생성
      const newMatch = await tx.match.create({
        data: {
          scheduleId: originalMatch.scheduleId,
          isLinedUp: originalMatch.isLinedUp,
          homeTeamMercenaryCount: originalMatch.homeTeamMercenaryCount,
          awayTeamMercenaryCount: originalMatch.awayTeamMercenaryCount,
          createdById: originalMatch.createdById,
          homeTeamId: originalMatch.homeTeamId,
          awayTeamId: originalMatch.awayTeamId,
        },
      });

      // 라인업 복제
      if (originalMatch.lineups.length > 0) {
        const newLineups = originalMatch.lineups.map((lineup) => ({
          matchId: newMatch.id,
          userId: lineup.userId,
          side: lineup.side,
        }));

        await tx.lineup.createMany({
          data: newLineups,
        });
      }

      // 스케줄 상태 업데이트
      await updateScheduleStatusBasedOnMatches(originalMatch.scheduleId, tx);

      return newMatch;
    });

    revalidatePath(`/schedules/${originalMatch.scheduleId}/match/${result.id}`);

    return {
      success: true,
      message: "새로운 경기가 생성되었습니다",
      data: { matchId: result.id },
    };
  } catch (error) {
    console.error("자체전 복제 실패:", error);
    return { success: false, error: "경기 복제에 실패했습니다" };
  }
}

/**
 * 라인업 사이드 변경 (자체전용)
 */
export async function updateLineupSide(lineupId: string, side: TeamSide) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 라인업 업데이트
      const lineup = await tx.lineup.update({
        where: { id: lineupId },
        data: { side },
        include: {
          match: {
            select: {
              scheduleId: true,
              id: true,
            },
          },
        },
      });

      // 현재 매치의 모든 라인업 조회
      const lineups = await tx.lineup.findMany({
        where: { matchId: lineup.matchId },
        select: { side: true },
      });

      const lineupStatus = checkLineupStatus(lineups);

      // 매치의 isLinedUp 상태 업데이트
      await tx.match.update({
        where: { id: lineup.matchId },
        data: { isLinedUp: lineupStatus.isLinedUp },
      });

      // 스케줄 상태 업데이트
      await updateScheduleStatusBasedOnMatches(lineup.match.scheduleId, tx);

      return {
        scheduleId: lineup.match.scheduleId,
        matchId: lineup.match.id,
      };
    });

    revalidatePath(`/schedules/${result.scheduleId}/match/${result.matchId}`);
    return { success: true };
  } catch (error) {
    console.error("라인업 사이드 변경 실패:", error);
    return { success: false, error: "사이드 변경에 실패했습니다" };
  }
}

/**
 * 라인업에서 선수 제거 (자체전용, 친선전용)
 */
export async function removeFromLineup(lineupId: string) {
  try {
    const lineup = await prisma.lineup.findUnique({
      where: { id: lineupId },
      include: {
        match: {
          select: {
            scheduleId: true,
            id: true,
          },
        },
      },
    });

    if (!lineup) {
      return { success: false, error: "라인업을 찾을 수 없습니다" };
    }

    // 트랜잭션으로 처리하여 데이터 일관성 보장
    await prisma.$transaction(async (tx) => {
      // 라인업 삭제
      await tx.lineup.delete({
        where: { id: lineupId },
      });

      // 삭제 후 남은 라인업 확인
      const remainingLineups = await tx.lineup.findMany({
        where: { matchId: lineup.matchId },
        select: { side: true },
      });

      const lineupStatus = checkLineupStatus(remainingLineups);

      // 매치의 isLinedUp 상태 업데이트
      await tx.match.update({
        where: { id: lineup.matchId },
        data: { isLinedUp: lineupStatus.isLinedUp },
      });

      // 스케줄 상태 업데이트
      await updateScheduleStatusBasedOnMatches(lineup.match.scheduleId, tx);
    });

    revalidatePath(
      `/schedules/${lineup.match.scheduleId}/match/${lineup.match.id}`
    );
    return { success: true };
  } catch (error) {
    console.error("라인업에서 선수 제거 실패:", error);
    return { success: false, error: "선수 제거에 실패했습니다" };
  }
}

/**
 * 용병 수 업데이트
 */
export async function updateMercenaryCount(
  matchId: string,
  homeCount: number,
  awayCount: number
) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        schedule: {
          select: {
            matchType: true,
            id: true,
          },
        },
      },
    });

    if (!match) {
      return { success: false, error: "매치를 찾을 수 없습니다" };
    }

    if (match.schedule.matchType === MatchType.SQUAD) {
      // 총 용병 수 계산
      const totalMercenaryCount = homeCount + awayCount;

      // undecided 용병 수 계산
      const undecidedCount = Math.max(
        0,
        match.undecidedTeamMercenaryCount -
          (totalMercenaryCount -
            match.homeTeamMercenaryCount -
            match.awayTeamMercenaryCount)
      );

      await prisma.match.update({
        where: { id: matchId },
        data: {
          homeTeamMercenaryCount: homeCount,
          awayTeamMercenaryCount: awayCount,
          undecidedTeamMercenaryCount: undecidedCount,
        },
      });
    } else {
      await prisma.match.update({
        where: { id: matchId },
        data: {
          homeTeamMercenaryCount: homeCount,
          awayTeamMercenaryCount: awayCount,
        },
      });
    }

    revalidatePath(`/schedules/${match.schedule.id}/match/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error("용병 수 업데이트 실패:", error);
    return { success: false, error: "용병 수 업데이트에 실패했습니다" };
  }
}

/**
 * 출전 명단 초기화 (자체전용)
 */
export async function resetLineups(matchId: string) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        schedule: {
          select: {
            matchType: true,
            id: true,
            hostTeamMercenaryCount: true,
          },
        },
        lineups: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!match) {
      return { success: false, error: "매치를 찾을 수 없습니다" };
    }

    if (match.schedule.matchType !== MatchType.SQUAD) {
      return { success: false, error: "자체전이 아닙니다" };
    }

    // 트랜잭션으로 처리
    await prisma.$transaction(async (tx) => {
      // 모든 라인업을 UNDECIDED로 변경
      const updatePromises = match.lineups.map((lineup) =>
        tx.lineup.update({
          where: { id: lineup.id },
          data: { side: "UNDECIDED" },
        })
      );

      await Promise.all(updatePromises);

      // 매치 정보 업데이트
      await tx.match.update({
        where: { id: matchId },
        data: {
          homeTeamMercenaryCount: 0,
          awayTeamMercenaryCount: 0,
          undecidedTeamMercenaryCount: match.schedule.hostTeamMercenaryCount,
          isLinedUp: false,
        },
      });

      // 스케줄 상태 업데이트
      await updateScheduleStatusBasedOnMatches(match.schedule.id, tx);
    });

    revalidatePath(`/schedules/${match.schedule.id}/match/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error("출전 명단 초기화 실패:", error);
    return { success: false, error: "출전 명단 초기화에 실패했습니다" };
  }
}
