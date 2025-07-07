"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

export async function getPlayers() {
  try {
    const session = await auth();

    const playersPromise = prisma.user.findMany({
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

    const userPromise = session?.user?.id
      ? prisma.user.findUnique({
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
        })
      : Promise.resolve(null);

    const [players, user] = await Promise.all([playersPromise, userPromise]);

    return {
      success: true,
      data: { user, players },
    };
  } catch (error) {
    console.error("회원 데이터 조회 실패:", error);
    return { success: false, error: "서버 오류가 발생했습니다" };
  }
}
