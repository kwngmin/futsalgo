// auth.config.ts
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
    newUser: "/onboarding",
  },
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;
