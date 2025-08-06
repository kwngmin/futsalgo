"use server";

import { prisma } from "@/shared/lib/prisma";
import { TeamSide } from "@prisma/client";
import { GoalRecordFormData } from "../ui/GoalRecord";
import { revalidatePath } from "next/cache";

export async function createGoalRecord(
  matchId: string,
  data: GoalRecordFormData
) {
  try {
    // 매치 정보 조회
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      // select: {
      //   scheduleId: true,
      // },
      include: {
        homeTeam: true,
        awayTeam: true,
        lineups: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!match) {
      throw new Error("매치를 찾을 수 없습니다.");
    }

    // 1. 실제 골 넣은 선수가 속한 팀 확인
    let actualPlayerSide: TeamSide;

    if (data.isScoredByMercenary) {
      // 용병인 경우 scorerSide 사용 (UI에서 설정한 용병이 속한 팀)
      actualPlayerSide = data.scorerSide;
    } else {
      // 팀 소속 선수인 경우 라인업에서 확인
      const scorerLineup = match.lineups.find(
        (lineup) => lineup.userId === data.scorerId
      );

      if (!scorerLineup) {
        throw new Error("골 넣은 선수가 라인업에 없습니다.");
      }

      actualPlayerSide = scorerLineup.side;
    }

    // 2. 자책골 여부에 따른 득점팀 결정
    let benefitingTeam: TeamSide; // 실제 득점을 얻는 팀

    if (data.isOwnGoal) {
      // 자책골: 골 넣은 선수의 반대팀이 득점
      benefitingTeam = actualPlayerSide === "HOME" ? "AWAY" : "HOME";
    } else {
      // 일반골: 골 넣은 선수의 팀이 득점
      benefitingTeam = actualPlayerSide;
    }

    // 3. 어시스트 검증 (자책골이 아닌 경우만)
    if (!data.isOwnGoal && data.assistId && !data.isAssistedByMercenary) {
      const assistLineup = match.lineups.find(
        (lineup) => lineup.userId === data.assistId
      );

      if (!assistLineup) {
        throw new Error("어시스트 선수가 라인업에 없습니다.");
      }

      // 어시스트한 선수가 득점팀과 같은 팀인지 확인
      if (assistLineup.side !== benefitingTeam) {
        throw new Error("어시스트 선수는 득점팀과 같은 팀이어야 합니다.");
      }
    }

    // 4. 골 기록 생성
    const goalRecord = await prisma.goalRecord.create({
      data: {
        matchId,
        scorerSide: actualPlayerSide, // 실제 골 넣은 선수의 팀
        scorerId: data.isScoredByMercenary ? null : data.scorerId,
        assistId:
          !data.isOwnGoal && !data.isAssistedByMercenary ? data.assistId : null,
        isOwnGoal: data.isOwnGoal,
        isScoredByMercenary: data.isScoredByMercenary,
        isAssistedByMercenary: !data.isOwnGoal
          ? data.isAssistedByMercenary
          : false,
      },
      include: {
        scorer: true,
        assist: true,
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    });

    // 5. 매치 점수 업데이트 (실제 득점팀 기준)
    if (benefitingTeam === "HOME") {
      await prisma.match.update({
        where: { id: matchId },
        data: {
          homeScore: {
            increment: 1,
          },
        },
      });
    } else {
      await prisma.match.update({
        where: { id: matchId },
        data: {
          awayScore: {
            increment: 1,
          },
        },
      });
    }

    revalidatePath(`/schedule/${match.scheduleId}/match/${matchId}`);

    return {
      success: true,
      data: goalRecord,
    };
  } catch (error) {
    console.error("골 기록 생성 실패:", error);
    throw new Error(
      error instanceof Error ? error.message : "골 기록 생성에 실패했습니다."
    );
  }
}

export async function deleteGoalRecord(goalRecordId: string) {
  try {
    // 골 기록 조회
    const goalRecord = await prisma.goalRecord.findUnique({
      where: { id: goalRecordId },
      include: {
        match: true,
      },
    });

    if (!goalRecord) {
      throw new Error("골 기록을 찾을 수 없습니다.");
    }

    // 실제 득점팀 계산 (골 기록 생성 시와 동일한 로직)
    const benefitingTeam = goalRecord.isOwnGoal
      ? goalRecord.scorerSide === "HOME"
        ? "AWAY"
        : "HOME" // 자책골: 반대팀 득점
      : goalRecord.scorerSide; // 일반골: 골 넣은 팀 득점

    // 골 기록 삭제
    await prisma.goalRecord.delete({
      where: { id: goalRecordId },
    });

    // 매치 점수 차감
    if (benefitingTeam === "HOME") {
      await prisma.match.update({
        where: { id: goalRecord.matchId },
        data: {
          homeScore: {
            decrement: 1,
          },
        },
      });
    } else {
      await prisma.match.update({
        where: { id: goalRecord.matchId },
        data: {
          awayScore: {
            decrement: 1,
          },
        },
      });
    }

    revalidatePath(
      `/schedule/${goalRecord.match.scheduleId}/match/${goalRecord.matchId}`
    );

    return { success: true };
  } catch (error) {
    console.error("골 기록 삭제 실패:", error);
    throw new Error(
      error instanceof Error ? error.message : "골 기록 삭제에 실패했습니다."
    );
  }
}
