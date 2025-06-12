import NextAuth, { type DefaultSession } from "next-auth";
import { prisma } from "@/shared/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nickname: string | null;
      createdAt: Date;
      provider: string;
    } & DefaultSession["user"];
  }
}

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
        } else {
          // 이메일이 사용 가능하면 그대로 사용
          return adapter.createUser!(data);
        }
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
  // 세션 전략을 JWT로 설정
  session: {
    strategy: "jwt",
    // 세션 유지기간 설정 (초 단위)
    maxAge: 30 * 24 * 60 * 60, // 30일 (기본값)
    // maxAge: 7 * 24 * 60 * 60,  // 7일
    // maxAge: 24 * 60 * 60,      // 1일

    // 세션 업데이트 주기 (JWT에서는 사용되지 않음)
    updateAge: 24 * 60 * 60, // 24시간마다 토큰 갱신
  },
  // JWT 토큰 설정
  jwt: {
    // JWT 토큰 유지기간 (session.maxAge와 동일하게 설정 권장)
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      console.log(`로그인 시도: ${user.email} via ${account?.provider}`);

      if (!account) {
        console.error("계정 정보가 없습니다.");
        return false;
      }

      // 기본 검증만 수행, 이메일 처리는 어댑터에서
      return true;
    },
    // JWT 토큰에 모든 사용자 정보 포함
    jwt: async ({ token, user, account }) => {
      if (user) {
        // 데이터베이스에서 최신 사용자 정보 가져오기
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.nickname = dbUser.nickname;
          token.createdAt = dbUser.createdAt;
        }
      }

      // Provider 정보도 추가
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },

    // 세션에 모든 정보 포함
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.nickname = token.nickname as string | null;
        session.user.createdAt = token.createdAt as Date;
        // Provider 정보도 세션에 포함
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (!user.email) {
        console.log(
          `이메일 없이 사용자 생성 완료: ${user.name} (ID: ${user.id})`
        );
        // 필요시 이메일 설정 안내 로직
      } else {
        console.log(`사용자 생성 완료: ${user.email}`);
      }
    },
  },
  pages: {
    // signIn: "/login",
    newUser: "/onboarding",
    // error: "/login",
  },
});
