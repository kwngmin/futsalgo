// middleware.ts
import NextAuth from "next-auth";
import authConfig from "./shared/config/auth.config";

// authorized 콜백이 모든 로직을 처리
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
