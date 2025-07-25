"use server";

import { prisma } from "@/shared/lib/prisma";
import { TeamSide } from "@prisma/client";
import { GoalRecordFormData } from "../ui/GoalRecord";

export async function createGoalRecord(
  matchId: string,
  data: GoalRecordFormData
) {
  try {
    // 매치 정보 조회
    const match = await prisma.match.findUnique({
      where: { id: matchId },
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

    // scorer의 실제 팀 확인 (용병이 아닌 경우)
    let actualScorerSide: TeamSide;

    if (data.isScoredByMercenary) {
      // 용병인 경우 scorerSide는 득점팀과 반대
      actualScorerSide = data.isOwnGoal
        ? data.scorerSide // 자책골이면 득점팀과 같은 편 용병
        : data.scorerSide === "HOME"
        ? "AWAY"
        : "HOME"; // 일반골이면 득점팀 반대편 용병
    } else {
      // 팀 소속 선수인 경우 라인업에서 확인
      const scorerLineup = match.lineups.find(
        (lineup) => lineup.userId === data.scorerId
      );

      if (!scorerLineup) {
        throw new Error("골 넣은 선수가 라인업에 없습니다.");
      }

      actualScorerSide = scorerLineup.side;
    }

    // 자책골 여부 결정
    const isOwnGoal = data.isOwnGoal || actualScorerSide !== data.scorerSide;

    // 어시스트 검증 (자책골이 아닌 경우만)
    if (!isOwnGoal && data.assistId && !data.isAssistedByMercenary) {
      const assistLineup = match.lineups.find(
        (lineup) => lineup.userId === data.assistId
      );

      if (!assistLineup) {
        throw new Error("어시스트 선수가 라인업에 없습니다.");
      }
    }

    // 골 기록 생성
    const goalRecord = await prisma.goalRecord.create({
      data: {
        matchId,
        scorerSide: actualScorerSide,
        scorerId: data.isScoredByMercenary ? null : data.scorerId,
        assistId:
          !isOwnGoal && !data.isAssistedByMercenary ? data.assistId : null,
        isOwnGoal,
        isScoredByMercenary: data.isScoredByMercenary,
        isAssistedByMercenary: !isOwnGoal ? data.isAssistedByMercenary : false,
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

    // 매치 점수 업데이트
    const goalTeam = isOwnGoal
      ? actualScorerSide === "HOME"
        ? "AWAY"
        : "HOME"
      : actualScorerSide;

    if (goalTeam === "HOME") {
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

    // 득점팀 계산
    const goalTeam = goalRecord.isOwnGoal
      ? goalRecord.scorerSide === "HOME"
        ? "AWAY"
        : "HOME"
      : goalRecord.scorerSide;

    // 골 기록 삭제
    await prisma.goalRecord.delete({
      where: { id: goalRecordId },
    });

    // 매치 점수 차감
    if (goalTeam === "HOME") {
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

    return { success: true };
  } catch (error) {
    console.error("골 기록 삭제 실패:", error);
    throw new Error(
      error instanceof Error ? error.message : "골 기록 삭제에 실패했습니다."
    );
  }
}
