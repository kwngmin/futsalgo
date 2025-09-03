"use server";

import { prisma } from "@/shared/lib/prisma";
import { TeamSide, MatchType, AttendanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * 경기 삭제
 */
export async function deleteMatch(matchId: string, scheduleId: string) {
  try {
    // 트랜잭션으로 관련된 모든 데이터 삭제
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
    });

    revalidatePath(`/schedule/${scheduleId}`);
    redirect(`/schedule/${scheduleId}`);
  } catch (error) {
    console.error("경기 삭제 실패:", error);
    return { success: false, error: "경기 삭제에 실패했습니다" };
  }
}

/**
 * 사이드 변경 (호스트팀과 초대팀의 사이드를 서로 바꿈)
 */
export async function toggleSides(matchId: string) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        schedule: true,
        lineups: true,
      },
    });

    if (!match) {
      return { success: false, error: "매치를 찾을 수 없습니다" };
    }

    await prisma.$transaction(async (tx) => {
      // 모든 라인업의 사이드를 반대로 변경
      const updatePromises = match.lineups.map((lineup) => {
        let newSide: TeamSide;
        if (lineup.side === "HOME") {
          newSide = "AWAY";
        } else if (lineup.side === "AWAY") {
          newSide = "HOME";
        } else {
          newSide = "UNDECIDED"; // UNDECIDED는 그대로 유지
        }

        return tx.lineup.update({
          where: { id: lineup.id },
          data: { side: newSide },
        });
      });

      // 스코어도 서로 바꿈
      await tx.match.update({
        where: { id: matchId },
        data: {
          homeScore: match.awayScore,
          awayScore: match.homeScore,
        },
      });

      await Promise.all(updatePromises);
    });

    revalidatePath(`/schedule/${match.scheduleId}/match/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error("사이드 변경 실패:", error);
    return { success: false, error: "사이드 변경에 실패했습니다" };
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
 * 친선전 명단 업데이트: 참석자들을 팀별로 사이드 배정
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

    await prisma.lineup.delete({
      where: { id: lineupId },
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
