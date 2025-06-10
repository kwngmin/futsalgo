import NextAuth, { type DefaultSession } from "next-auth";
import { prisma } from "@/shared/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import { Foot, Gender, Position } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      birthYear: number | null;
      createdAt: Date;
      email: string | null;
      emailVerified: Date | null;
      foot: Foot | null;
      gender: Gender | null;
      height: number | null;
      image: string | null;
      injured: boolean;
      name: string;
      nickname: string | null;
      phone: string | null;
      position: Position | null;
      updatedAt: Date;
      weight: number | null;
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
  callbacks: {
    signIn: async ({
      user, //
      account,
      // profile,
    }) => {
      console.log(`로그인 시도: ${user.email} via ${account?.provider}`);

      if (!account) {
        console.error("계정 정보가 없습니다.");
        return false;
      }

      // 기본 검증만 수행, 이메일 처리는 어댑터에서
      return true;
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
