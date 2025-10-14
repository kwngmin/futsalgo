// middleware.ts
import { auth } from "@/shared/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { OnboardingStep } from "@prisma/client";

const AUTH_ROUTES = ["/login", "/signup"];
const ONBOARDING_PREFIX = "/onboarding";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 라우트는 미들웨어에서 제외
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Auth.js의 auth() 헬퍼로 세션 가져오기
  const session = await auth();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isOnboardingRoute = pathname.startsWith(ONBOARDING_PREFIX);

  // 세션이 없는 경우: 모든 페이지 접근 허용
  if (!session?.user) {
    return NextResponse.next();
  }

  // 세션이 있는 경우
  const isOnboardingComplete = session.user.onboardingStep === "COMPLETE";

  if (process.env.NODE_ENV === "development") {
    console.log("[Middleware] 세션 확인:", {
      id: session.user.id,
      onboardingStep: session.user.onboardingStep,
      pathname,
    });
  }

  // 1. 온보딩 미완료 → /onboarding으로 강제 리다이렉트
  if (!isOnboardingComplete && !isOnboardingRoute) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] 온보딩 미완료 -> /onboarding으로 리다이렉트", {
        currentStep: session.user.onboardingStep,
      });
    }
    return NextResponse.redirect(new URL(ONBOARDING_PREFIX, request.url));
  }

  // 2. 온보딩 완료 → /onboarding 접근 차단
  if (isOnboardingComplete && isOnboardingRoute) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] 온보딩 완료 -> 홈으로 리다이렉트");
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. 로그인 사용자 → /login, /signup 접근 차단
  if (isAuthRoute) {
    const redirectUrl = isOnboardingComplete ? "/" : ONBOARDING_PREFIX;
    if (process.env.NODE_ENV === "development") {
      console.log(`[Middleware] 이미 로그인됨 -> ${redirectUrl}로 리다이렉트`);
    }
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
