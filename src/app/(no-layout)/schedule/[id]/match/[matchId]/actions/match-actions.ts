"use server";

import { prisma } from "@/shared/lib/prisma";
import {
  TeamSide,
  MatchType,
  AttendanceStatus,
  ScheduleStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * 경기 삭제
 */
export async function deleteMatch(matchId: string, scheduleId: string) {
  try {
    // 트랜잭션으로 관련된 모든 데이터 삭제 및 스케줄 상태 업데이트
    await prisma.$transaction(async (tx) => {
      // 골 기록 삭제
      await tx.goalRecord.deleteMany({
        where: { matchId },
      });

      // 라인업 삭제
      await tx.lineup.deleteMany({
        where: { matchId },
      });

      // 매치 삭제
      await tx.match.delete({
        where: { id: matchId },
      });

      // 스케줄의 남은 매치 수 확인
      const remainingMatches = await tx.match.count({
        where: { scheduleId },
      });

      // 매치가 모두 삭제되었고 상태가 PLAY라면 READY로 변경
      if (remainingMatches === 0) {
        const schedule = await tx.schedule.findUnique({
          where: { id: scheduleId },
          select: { status: true },
        });

        if (schedule?.status === ScheduleStatus.PLAY) {
          await tx.schedule.update({
            where: { id: scheduleId },
            data: { status: ScheduleStatus.READY },
          });
        }
      }
    });

    revalidatePath(`/schedule/${scheduleId}`);
    redirect(`/schedule/${scheduleId}`);
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

    if (missingAttendees.length === 0) {
      return { success: true, message: "추가할 인원이 없습니다" };
    }

    // 현재 HOME과 AWAY 팀 인원 수 계산
    const homeCount = match.lineups.filter(
      (lineup) => lineup.side === "HOME"
    ).length;
    const awayCount = match.lineups.filter(
      (lineup) => lineup.side === "AWAY"
    ).length;

    const newLineups = missingAttendees.map((attendance) => {
      let side: TeamSide;

      if (homeCount === awayCount) {
        // 인원이 같으면 무작위로 배정
        side = Math.random() < 0.5 ? "HOME" : "AWAY";
      } else if (homeCount < awayCount) {
        // HOME팀이 적으면 HOME에 우선 배정
        side = "HOME";
      } else {
        // AWAY팀이 적으면 AWAY에 우선 배정
        side = "AWAY";
      }

      return {
        matchId,
        userId: attendance.userId,
        side,
      };
    });

    await prisma.lineup.createMany({
      data: newLineups,
    });

    revalidatePath(`/schedule/${match.scheduleId}/match/${matchId}`);
    return {
      success: true,
      message: `${missingAttendees.length}명의 인원이 추가되었습니다`,
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

    // 기존 라인업 삭제
    await prisma.lineup.deleteMany({
      where: { matchId },
    });

    // 사이드가 변경되었는지 확인하는 로직이 필요하지만,
    // 여기서는 간단히 HOST팀은 HOME, INVITED팀은 AWAY로 배정
    // 실제 구현에서는 사이드 변경 상태를 어딘가에 저장해야 함

    const newLineups = match.schedule.attendances.map((attendance) => {
      // TeamType에 따라 사이드 결정
      const side: TeamSide = attendance.teamType === "HOST" ? "HOME" : "AWAY";

      return {
        matchId,
        userId: attendance.userId,
        side,
      };
    });

    if (newLineups.length > 0) {
      await prisma.lineup.createMany({
        data: newLineups,
      });
    }

    const homeCount = newLineups.filter(
      (lineup) => lineup.side === "HOME"
    ).length;
    const awayCount = newLineups.filter(
      (lineup) => lineup.side === "AWAY"
    ).length;

    const isLinedUp = homeCount > 0 && awayCount > 0;

    await prisma.match.update({
      where: { id: matchId },
      data: { isLinedUp },
    });

    revalidatePath(`/schedule/${match.scheduleId}/match/${matchId}`);
    return {
      success: true,
      message: `${newLineups.length}명의 명단이 업데이트되었습니다`,
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
      // 1. 기존 라인업 삭제 (특정 사이드만)
      await tx.lineup.deleteMany({
        where: { matchId, side },
      });

      // 2. 새로운 라인업 생성
      const newLineups = match.schedule.attendances.map((attendance) => {
        // TeamType에 따라 사이드 결정
        const assignedSide: TeamSide =
          attendance.teamType === "HOST" ? "HOME" : "AWAY";

        return {
          matchId,
          userId: attendance.userId,
          side: assignedSide,
        };
      });

      if (newLineups.length > 0) {
        await tx.lineup.createMany({
          data: newLineups,
        });
      }

      // 3. 업데이트 후 전체 라인업 상태 확인
      const allLineups = await tx.lineup.findMany({
        where: { matchId },
        select: { side: true },
      });

      const homeCount = allLineups.filter(
        (lineup) => lineup.side === "HOME"
      ).length;
      const awayCount = allLineups.filter(
        (lineup) => lineup.side === "AWAY"
      ).length;

      // 4. isLinedUp 상태 업데이트 (덮어씌우기 방식)
      const isLinedUp = homeCount > 0 && awayCount > 0;

      await tx.match.update({
        where: { id: matchId },
        data: { isLinedUp },
      });

      return {
        lineupsCreated: newLineups.length,
        homeCount,
        awayCount,
        isLinedUp,
      };
    });

    revalidatePath(`/schedule/${match.scheduleId}/match/${matchId}`);

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
 * 라인업 사이드 변경
 */
export async function updateLineupSide(lineupId: string, side: TeamSide) {
  try {
    const lineup = await prisma.lineup.update({
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

    const lineups = await prisma.lineup.findMany({
      where: { matchId: lineup.matchId },
      select: { side: true },
    });

    const homeCount = lineups.filter((lineup) => lineup.side === "HOME").length;
    const awayCount = lineups.filter((lineup) => lineup.side === "AWAY").length;

    const isLinedUp = homeCount > 0 && awayCount > 0;

    await prisma.match.update({
      where: { id: lineup.matchId },
      data: { isLinedUp },
    });

    revalidatePath(
      `/schedule/${lineup.match.scheduleId}/match/${lineup.match.id}`
    );
    return { success: true };
  } catch (error) {
    console.error("라인업 사이드 변경 실패:", error);
    return { success: false, error: "사이드 변경에 실패했습니다" };
  }
}

/**
 * 라인업에서 선수 제거
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
      // 1. 먼저 lineup 삭제
      await tx.lineup.delete({
        where: { id: lineupId },
      });

      // 2. 삭제 후 남은 lineup 개수 확인
      const remainingLineups = await tx.lineup.findMany({
        where: { matchId: lineup.matchId },
        select: {
          side: true,
        },
      });

      const homeCount = remainingLineups.filter(
        (lineup) => lineup.side === "HOME"
      ).length;
      const awayCount = remainingLineups.filter(
        (lineup) => lineup.side === "AWAY"
      ).length;

      // 3. HOME 또는 AWAY 중 하나라도 비어있으면 isLinedUp을 false로 설정
      if (homeCount === 0 || awayCount === 0) {
        await tx.match.update({
          where: { id: lineup.matchId },
          data: {
            isLinedUp: false,
          },
        });
      }
    });

    revalidatePath(
      `/schedule/${lineup.match.scheduleId}/match/${lineup.match.id}`
    );
    return { success: true };
  } catch (error) {
    console.error("라인업에서 선수 제거 실패:", error);
    return { success: false, error: "선수 제거에 실패했습니다" };
  }
}

/**
 * 용병 수 업데이트 (자체전용)
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
      // 총 용병 수 계산 (homeCount + awayCount)
      const totalMercenaryCount = homeCount + awayCount;

      // undecided 용병 수 계산 (총 용병 수에서 배정된 용병 수를 뺀 값)
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

    revalidatePath(`/schedule/${match.schedule.id}/match/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error("용병 수 업데이트 실패:", error);
    return { success: false, error: "용병 수 업데이트에 실패했습니다" };
  }
}

//
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

    // 업데이트 실행
    const updatePromises = match.lineups.map((lineup) => {
      return prisma.lineup.update({
        where: { id: lineup.id },
        data: { side: "UNDECIDED" },
      });
    });

    await prisma.$transaction(updatePromises);

    await prisma.match.update({
      where: { id: matchId },
      data: {
        homeTeamMercenaryCount: 0,
        awayTeamMercenaryCount: 0,
        undecidedTeamMercenaryCount: match.schedule.hostTeamMercenaryCount,
        isLinedUp: false,
      },
    });

    revalidatePath(`/schedule/${match.schedule.id}/match/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error("출전 명단 초기화 실패:", error);
    return { success: false, error: "출전 명단 초기화에 실패했습니다" };
  }
}
