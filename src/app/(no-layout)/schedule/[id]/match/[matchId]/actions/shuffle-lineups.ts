"use server";

import { prisma } from "@/shared/lib/prisma";
import { TeamSide } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * 주어진 matchId의 라인업을 무작위로 HOME과 AWAY로 재배정하는 함수
 * @param matchId - 매치 ID
 * @returns 성공 여부와 메시지 또는 에러
 */
export async function shuffleLineups(matchId: string) {
  try {
    // 매치 존재 여부 확인 및 라인업 조회
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        scheduleId: true,
        lineups: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!match) {
      return { success: false, error: "매치를 찾을 수 없습니다" };
    }

    const lineups = match.lineups;

    if (lineups.length === 0) {
      return { success: false, error: "라인업이 없습니다" };
    }

    // 라인업을 무작위로 섞기
    const shuffledLineups = [...lineups].sort(() => Math.random() - 0.5);

    // HOME과 AWAY로 나누기
    const totalPlayers = shuffledLineups.length;
    const homeCount = Math.floor(totalPlayers / 2);
    const awayCount = totalPlayers - homeCount;

    // 홀수인 경우 무작위로 어느 팀이 더 많을지 결정
    const shouldHomeGetExtra = Math.random() < 0.5;

    let finalHomeCount: number;
    let finalAwayCount: number;

    if (totalPlayers % 2 === 0) {
      // 짝수인 경우 동일하게 분배
      finalHomeCount = homeCount;
      finalAwayCount = awayCount;
    } else {
      // 홀수인 경우 무작위로 한 팀에 1명 더 배정
      if (shouldHomeGetExtra) {
        finalHomeCount = homeCount + 1;
        finalAwayCount = awayCount;
      } else {
        finalHomeCount = homeCount;
        finalAwayCount = awayCount;
      }
    }

    // 라인업 업데이트 데이터 준비
    const updatePromises = shuffledLineups.map((lineup, index) => {
      const side: TeamSide = index < finalHomeCount ? "HOME" : "AWAY";

      return prisma.lineup.update({
        where: { id: lineup.id },
        data: { side },
      });
    });

    // 트랜잭션으로 모든 라인업 업데이트
    await prisma.$transaction(updatePromises);

    revalidatePath(`/schedule/${match.scheduleId}/match/${matchId}`);

    return {
      success: true,
      data: {
        totalPlayers,
        homeCount: finalHomeCount,
        awayCount: finalAwayCount,
        message: `라인업이 성공적으로 재배정되었습니다 (HOME: ${finalHomeCount}명, AWAY: ${finalAwayCount}명)`,
      },
    };
  } catch (error) {
    console.error("라인업 재배정 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}

/**
 * Fisher-Yates 셔플 알고리즘을 사용한 더 안전한 무작위 셔플 함수
 * (선택적으로 사용할 수 있는 개선된 버전)
 */
export async function shuffleLineupsAdvanced(matchId: string) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        scheduleId: true,
        lineups: {
          select: {
            id: true,
            userId: true,
          },
        },
        schedule: {
          select: {
            hostTeamMercenaryCount: true,
          },
        },
      },
    });

    if (!match) {
      return { success: false, error: "경기를 찾을 수 없습니다" };
    }

    const lineups = match.lineups;

    if (lineups.length === 0) {
      return { success: false, error: "라인업이 없습니다" };
    }

    // Fisher-Yates 셔플 알고리즘
    const shuffledLineups = [...lineups];
    for (let i = shuffledLineups.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledLineups[i], shuffledLineups[j]] = [
        shuffledLineups[j],
        shuffledLineups[i],
      ];
    }

    const totalPlayers = shuffledLineups.length;

    // 보다 균등한 분배를 위한 로직
    const baseCount = Math.floor(totalPlayers / 2);
    const remainder = totalPlayers % 2;

    // 홀수인 경우 무작위로 배정
    const homeGetsExtra = remainder === 1 && Math.random() < 0.5;

    const homeCount = baseCount + (homeGetsExtra ? remainder : 0);
    const awayCount = totalPlayers - homeCount;

    // 배치 정보 로깅 (선택사항)
    console.log(
      `라인업 재배정: 총 ${totalPlayers}명 → HOME: ${homeCount}명, AWAY: ${awayCount}명`
    );

    // 업데이트 실행
    const updatePromises = shuffledLineups.map((lineup, index) => {
      const side: TeamSide = index < homeCount ? "HOME" : "AWAY";

      return prisma.lineup.update({
        where: { id: lineup.id },
        data: { side },
      });
    });

    await prisma.$transaction(updatePromises);

    // 5. 용병 분배 로직
    const totalMercenaryCount = match.schedule.hostTeamMercenaryCount;
    let homeMercenaryCount = 0;
    let awayMercenaryCount = 0;

    if (totalMercenaryCount > 0) {
      const isLineupEven = lineups.length % 2 === 0;
      const isMercenaryEven = totalMercenaryCount % 2 === 0;

      if (isLineupEven) {
        if (isMercenaryEven) {
          // 라인업 짝수 & 용병 짝수: 반반 나누기
          homeMercenaryCount = totalMercenaryCount / 2;
          awayMercenaryCount = totalMercenaryCount / 2;
        } else {
          // 라인업 짝수 & 용병 홀수: 랜덤하게 한쪽에 더 많이
          const extraMercenary = 1;
          const baseMercenary = Math.floor(totalMercenaryCount / 2);
          if (Math.random() < 0.5) {
            homeMercenaryCount = baseMercenary + extraMercenary;
            awayMercenaryCount = baseMercenary;
          } else {
            homeMercenaryCount = baseMercenary;
            awayMercenaryCount = baseMercenary + extraMercenary;
          }
        }
      } else {
        // 라인업이 홀수인 경우
        if (isMercenaryEven) {
          // 라인업 홀수 & 용병 짝수: 반반 나누기
          homeMercenaryCount = totalMercenaryCount / 2;
          awayMercenaryCount = totalMercenaryCount / 2;
        } else {
          // 라인업 홀수 & 용병 홀수: 라인업이 적은 팀에 용병 더 많이
          const baseMercenary = Math.floor(totalMercenaryCount / 2);
          const extraMercenary = 1;

          if (homeCount < awayCount) {
            // HOME 팀 라인업이 적으면 HOME에 용병 더 많이
            homeMercenaryCount = baseMercenary + extraMercenary;
            awayMercenaryCount = baseMercenary;
          } else {
            // AWAY 팀 라인업이 적으면 AWAY에 용병 더 많이
            homeMercenaryCount = baseMercenary;
            awayMercenaryCount = baseMercenary + extraMercenary;
          }
        }
      }
    }

    await prisma.match.update({
      where: { id: matchId },
      data: {
        homeTeamMercenaryCount: homeMercenaryCount,
        awayTeamMercenaryCount: awayMercenaryCount,
        undecidedTeamMercenaryCount: 0,
      },
    });

    revalidatePath(`/schedule/${match.scheduleId}/match/${matchId}`);

    return {
      success: true,
      data: {
        totalPlayers,
        homeCount,
        awayCount,
        homeMercenaryCount,
        awayMercenaryCount,
        distribution: `HOME: ${homeCount}명, AWAY: ${awayCount}명`,
      },
    };
  } catch (error) {
    console.error("라인업 재배정 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
