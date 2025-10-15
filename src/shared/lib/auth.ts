// auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import { prisma } from "@/shared/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";
import { OnboardingStep } from "@prisma/client";
import authConfig from "../config/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nickname: string | null;
      createdAt: Date;
      provider: string;
      onboardingStep: OnboardingStep;
    } & DefaultSession["user"];
  }
  interface User {
    nickname?: string | null;
    onboardingStep?: OnboardingStep;
  }
  interface JWT {
    id?: string;
    nickname?: string | null;
    createdAt?: Date;
    provider?: string;
    onboardingStep?: OnboardingStep;
  }
}

/**
 * 개발 환경에서만 로그를 출력하는 헬퍼 함수
 */
const devLog = (message: string, data?: Record<string, unknown>) => {
  if (process.env.NODE_ENV === "development") {
    console.log(message, data || "");
  }
};

/**
 * 이메일 충돌을 처리하는 커스텀 Prisma Adapter
 * 동일한 이메일로 다른 provider 로그인 시 이메일을 빈 문자열로 설정
 */
export function CustomPrismaAdapter(): Adapter {
  const adapter = PrismaAdapter(prisma);

  return {
    ...adapter,
    async createUser(data): Promise<AdapterUser> {
      const { email, ...userData } = data;

      if (!email) {
        // 이메일이 없으면 그대로 생성
        return adapter.createUser!(data);
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          devLog(`이메일 충돌 감지: ${email} → 빈 문자열로 설정`);
          return adapter.createUser!({ ...userData, email: "" });
        }

        // 이메일이 사용 가능하면 그대로 사용
        return adapter.createUser!(data);
      } catch (error) {
        console.error("사용자 생성 중 오류:", error);
        throw error;
      }
    },

    async linkAccount(account): Promise<AdapterAccount | null> {
      try {
        const result = await adapter.linkAccount!(account);
        return result || null;
      } catch (error) {
        // OAuthAccountNotLinked 에러 처리
        if (
          error instanceof Error &&
          error.message.includes("OAuthAccountNotLinked")
        ) {
          devLog("OAuth 계정 연결 실패 - 이메일 충돌로 인한 에러 무시");
          return null;
        }
        throw error;
      }
    },
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: CustomPrismaAdapter(),
  callbacks: {
    signIn: async ({ user, account }) => {
      devLog(`로그인 시도: ${user.email} via ${account?.provider}`);
      return true;
    },

    jwt: async ({ token, user, trigger, account }) => {
      // 로그인 시점 (user 객체가 존재)
      if (user) {
        // DB에서 최신 사용자 정보 조회
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            nickname: true,
            onboardingStep: true,
            email: true,
            createdAt: true,
          },
        });

        if (dbUser) {
          // 기존 사용자: DB의 현재 온보딩 상태 유지
          token.id = user.id;
          token.nickname = dbUser.nickname;
          token.createdAt = dbUser.createdAt;
          token.provider = account?.provider;
          token.onboardingStep = dbUser.onboardingStep;

          devLog("[JWT] 기존 사용자 로그인:", {
            id: token.id,
            onboardingStep: token.onboardingStep,
            email: dbUser.email,
          });
        } else {
          // 신규 사용자: 초기 온보딩 단계 설정
          // OAuth로 이메일이 제공된 경우: PHONE 단계부터 시작
          // 이메일이 없는 경우: EMAIL 단계부터 시작
          token.id = user.id;
          token.nickname = user.nickname;
          token.createdAt = new Date();
          token.provider = account?.provider;
          token.onboardingStep = user.email
            ? OnboardingStep.PHONE
            : OnboardingStep.EMAIL;

          devLog("[JWT] 신규 사용자 생성:", {
            id: token.id,
            hasEmail: !!user.email,
            onboardingStep: token.onboardingStep,
          });
        }
      }

      // update trigger 시에만 DB 조회 (온보딩 진행 중 업데이트)
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { nickname: true, onboardingStep: true },
        });

        if (dbUser) {
          token.nickname = dbUser.nickname;
          token.onboardingStep = dbUser.onboardingStep;

          devLog("[JWT] 토큰 업데이트:", {
            id: token.id,
            onboardingStep: token.onboardingStep,
          });
        }
      }

      return token;
    },

    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.nickname = token.nickname as string | null;
        session.user.createdAt = token.createdAt as Date;
        session.user.provider = token.provider as string;
        session.user.onboardingStep = token.onboardingStep as OnboardingStep;
      }
      return session;
    },
  },
  events:
    process.env.NODE_ENV === "development"
      ? {
          createUser: async ({ user }) => {
            const message = user.email
              ? `사용자 생성 완료: ${user.email}`
              : `이메일 없이 사용자 생성 완료: ${user.name} (ID: ${user.id})`;
            console.log(message);
          },
          signIn: async ({ user }) => {
            console.log(`로그인 이벤트 완료: User ID ${user.id}`);
          },
          signOut: async () => {
            console.log("로그아웃 완료");
          },
        }
      : {},
});
