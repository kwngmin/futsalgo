import NextAuth, { type DefaultSession } from "next-auth";
import { prisma } from "@/shared/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
// import Naver from "next-auth/providers/naver";
import { OnboardingStep } from "@prisma/client";

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
 * 이메일 충돌을 처리하는 커스텀 Prisma Adapter
 * 동일한 이메일로 다른 provider 로그인 시 이메일을 null로 설정
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
          // 이메일이 이미 사용 중이면 null로 설정
          console.log(`이메일 충돌 감지: ${email} → null로 설정`);
          const userWithoutEmail = {
            ...userData,
            email: "",
          };
          return adapter.createUser!(userWithoutEmail);
        }

        // 이메일이 사용 가능하면 그대로 사용
        return adapter.createUser!(data);
      } catch (error) {
        console.error("사용자 생성 중 오류:", error);
        throw error;
      }
    },
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: CustomPrismaAdapter(),
  providers: [Google, Kakao],
  // providers: [Google, Kakao, Naver],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
    updateAge: 24 * 60 * 60, // 24시간마다 토큰 갱신
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      // 로그 제거 (프로덕션에서는 불필요)
      if (process.env.NODE_ENV === "development") {
        console.log(`로그인 시도: ${user.email} via ${account?.provider}`);
      }
      return true;
    },
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.id = user.id;
        token.nickname = user.nickname;
        token.createdAt = new Date();
        token.onboardingStep = user.onboardingStep;
      }

      // update trigger 시에만 DB 조회
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { nickname: true, onboardingStep: true },
        });

        if (dbUser) {
          token.nickname = dbUser.nickname;
          token.onboardingStep = dbUser.onboardingStep;
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
  events: {
    ...(process.env.NODE_ENV === "development" && {
      createUser: async ({ user }) => {
        if (!user.email) {
          console.log(
            `이메일 없이 사용자 생성 완료: ${user.name} (ID: ${user.id})`
          );
        } else {
          console.log(`사용자 생성 완료: ${user.email}`);
        }
      },
    }),
    ...(process.env.NODE_ENV === "development" && {
      signIn: async ({ user, account }) => {
        console.log(`로그인 완료: ${user.email} via ${account?.provider}`);
      },
    }),
    ...(process.env.NODE_ENV === "development" && {
      signOut: async () => {
        console.log("로그아웃 완료");
      },
    }),
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  debug: process.env.NODE_ENV === "development",
});
