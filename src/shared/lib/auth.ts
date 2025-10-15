// auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import { prisma } from "@/shared/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";
import { OnboardingStep } from "@prisma/client";
import authConfig from "../config/auth.config";
import { encrypt, decrypt, hashEmail } from "@/shared/lib/crypto";

function convertToHttps(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//i, "https://");
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nickname: string | null;
      createdAt: Date;
      provider: string;
      onboardingStep: OnboardingStep;
      isDeleted: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    nickname?: string | null;
    onboardingStep?: OnboardingStep;
    isDeleted?: boolean;
  }
  interface JWT {
    id?: string;
    nickname?: string | null;
    createdAt?: Date;
    provider?: string;
    onboardingStep?: OnboardingStep;
    isDeleted?: boolean;
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

      // 케이스 1: 이메일이 없는 경우 → EMAIL 단계부터 시작
      if (!email) {
        const newUser = await prisma.user.create({
          data: {
            ...userData,
            onboardingStep: OnboardingStep.EMAIL,
          },
        });

        devLog("이메일 없이 사용자 생성:", {
          id: newUser.id,
          onboardingStep: OnboardingStep.EMAIL,
        });

        return {
          ...newUser,
          email: "",
          emailVerified: newUser.emailVerified,
        };
      }

      try {
        const emailHashValue = hashEmail(email);

        const existingUser = await prisma.user.findUnique({
          where: { emailHash: emailHashValue },
        });

        // 케이스 3: 이메일 중복 → email = '' + EMAIL 단계
        if (existingUser) {
          devLog(`이메일 충돌 감지: ${email} → 빈 문자열 + EMAIL 단계`);

          const newUser = await prisma.user.create({
            data: {
              ...userData,
              email: "",
              onboardingStep: OnboardingStep.EMAIL,
            },
          });

          return {
            ...newUser,
            email: "",
            emailVerified: newUser.emailVerified,
          };
        }

        // 케이스 2: 이메일 제공 + 중복 없음 → 암호화 + PHONE 단계
        const encryptedEmail = encrypt(email);

        const newUser = await prisma.user.create({
          data: {
            ...userData,
            email: encryptedEmail,
            emailHash: emailHashValue,
            onboardingStep: OnboardingStep.PHONE,
          },
        });

        devLog("새 사용자 생성 (이메일 암호화):", {
          email,
          onboardingStep: OnboardingStep.PHONE,
        });

        return {
          ...newUser,
          email: decrypt(newUser.email || ""),
          emailVerified: newUser.emailVerified,
        };
      } catch (error) {
        console.error("사용자 생성 중 오류:", error);
        throw error;
      }
    },

    async getUserByEmail(email): Promise<AdapterUser | null> {
      if (!email) return null;

      try {
        const emailHashValue = hashEmail(email);

        const user = await prisma.user.findUnique({
          where: { emailHash: emailHashValue },
        });

        if (!user) return null;

        const decryptedEmail = user.email ? decrypt(user.email) : "";

        return {
          ...user,
          email: decryptedEmail,
          emailVerified: user.emailVerified,
        };
      } catch (error) {
        console.error("사용자 조회 중 오류:", error);
        return null;
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

      // 탈퇴한 사용자 로그인 차단
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isDeleted: true },
        });

        if (dbUser?.isDeleted) {
          devLog(`탈퇴한 사용자 로그인 시도 차단: ${user.id}`);
          return false;
        }
      }

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
            isDeleted: true,
          },
        });

        if (dbUser) {
          // 탈퇴한 사용자는 토큰 발급 중단
          if (dbUser.isDeleted) {
            devLog(`탈퇴한 사용자 토큰 발급 차단: ${user.id}`);
            throw new Error("탈퇴한 사용자입니다.");
          }

          token.id = user.id;
          token.nickname = dbUser.nickname;
          token.createdAt = dbUser.createdAt;
          token.provider = account?.provider;
          token.onboardingStep = dbUser.onboardingStep;
          token.isDeleted = dbUser.isDeleted;

          devLog("[JWT] 기존 사용자 로그인:", {
            id: token.id,
            onboardingStep: token.onboardingStep,
            isDeleted: token.isDeleted,
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
          token.isDeleted = false;

          devLog("[JWT] 예외: DB에서 찾지 못한 사용자:", {
            id: token.id,
            hasEmail: !!user.email,
            onboardingStep: token.onboardingStep,
          });
        }
      }

      // update trigger 시에만 DB 조회
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            nickname: true,
            onboardingStep: true,
            isDeleted: true,
          },
        });

        if (dbUser) {
          // 탈퇴 상태가 변경되었다면 토큰 무효화
          if (dbUser.isDeleted && !token.isDeleted) {
            devLog(`사용자 탈퇴 감지: ${token.id}`);
            throw new Error("탈퇴한 사용자입니다.");
          }

          token.nickname = dbUser.nickname;
          token.onboardingStep = dbUser.onboardingStep;
          token.isDeleted = dbUser.isDeleted;

          devLog("[JWT] 토큰 업데이트:", {
            id: token.id,
            onboardingStep: token.onboardingStep,
            isDeleted: token.isDeleted,
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
        session.user.image = convertToHttps(token.picture as string | null);
        session.user.isDeleted = token.isDeleted as boolean;
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
