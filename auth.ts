// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { Prisma } from "@prisma/client";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";

export const { handlers, signIn, signOut, auth } = NextAuth({
  //   adapter: PrismaAdapter(Prisma),
  providers: [Google, Kakao],
});
