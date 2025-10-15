// shared/config/auth.config.ts
import { OnboardingStep } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";

// Prisma adapter 없는 경량 설정 (Edge Runtime용)
export default {
  providers: [Google, Kakao, Naver],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
    updateAge: 24 * 60 * 60, // 24시간마다 토큰 갱신
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Edge Runtime에서도 JWT에 커스텀 필드 포함
    jwt: async ({ token, user, account }) => {
      // 로그인 시점에만 user가 존재
      if (user) {
        token.id = user.id;
        token.nickname = user.nickname;
        token.onboardingStep = user.onboardingStep;
        token.provider = account?.provider;
      }
      return token;
    },

    // Edge Runtime에서도 session에 커스텀 필드 포함
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.nickname = token.nickname as string | null;
        session.user.provider = token.provider as string;
        session.user.onboardingStep = token.onboardingStep as OnboardingStep;
      }
      return session;
    },

    // 미들웨어에서 실행되는 인가 콜백
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // API 라우트는 항상 허용 (NextAuth API 포함)
      if (pathname.startsWith("/api")) {
        return true;
      }

      const isOnOnboarding = pathname.startsWith("/onboarding");
      const isOnAuth = pathname === "/login" || pathname === "/signup";

      if (isLoggedIn) {
        const isOnboardingComplete = auth.user.onboardingStep === "COMPLETE";

        // 온보딩 미완료 시 /onboarding으로
        if (!isOnboardingComplete && !isOnOnboarding) {
          return Response.redirect(new URL("/onboarding", nextUrl));
        }

        // 온보딩 완료 시 /onboarding 접근 차단
        if (isOnboardingComplete && isOnOnboarding) {
          return Response.redirect(new URL("/", nextUrl));
        }

        // 로그인 사용자가 auth 페이지 접근 차단
        if (isOnAuth) {
          const redirectUrl = isOnboardingComplete ? "/" : "/onboarding";
          return Response.redirect(new URL(redirectUrl, nextUrl));
        }
      }

      return true;
    },
  },
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;
