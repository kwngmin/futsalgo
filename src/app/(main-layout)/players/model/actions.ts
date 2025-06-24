"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function getPlayers() {
  try {
    const session = await auth();

    const players = await prisma.user.findMany({
      where: session?.user?.id
        ? {
            NOT: {
              id: session.user.id,
            },
          }
        : {},
      include: {
        teams: {
          where: {
            status: "APPROVED", // 승인된 팀 멤버십만 포함
          },
          select: {
            team: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                description: true,
                city: true,
                district: true,
                status: true,
                recruitmentStatus: true,
                gender: true,
                level: true,
              },
            },
            status: true,
            role: true,
            joinedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          teams: {
            where: {
              status: "APPROVED", // 현재 사용자의 승인된 팀 멤버십도 포함
            },
            select: {
              team: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                  description: true,
                  city: true,
                  district: true,
                  status: true,
                  recruitmentStatus: true,
                  gender: true,
                  level: true,
                },
              },
              status: true,
              role: true,
              joinedAt: true,
            },
          },
        },
      });

      return {
        success: true,
        data: { user, players },
      };
    }

    // 세션이 없는 경우: user 없이 players만 전달
    return {
      success: true,
      data: { user: null, players },
    };
  } catch (error) {
    console.error("선수 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
