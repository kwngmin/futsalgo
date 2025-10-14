// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { jwtDecrypt } from "jose";
import { OnboardingStep } from "@prisma/client";

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

interface SessionPayload {
  id: string;
  onboardingStep: OnboardingStep;
}

const AUTH_ROUTES = ["/login", "/signup"];
const ONBOARDING_PREFIX = "/onboarding";

async function getSessionFromToken(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    // jwtVerify 대신 jwtDecrypt 사용 (Auth.js는 JWT를 암호화함)
    const { payload } = await jwtDecrypt(token, secret);

    const session: SessionPayload = {
      id: payload.id as string,
      onboardingStep:
        (payload.onboardingStep as OnboardingStep) ?? OnboardingStep.EMAIL,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] 세션 확인:", {
        id: session.id,
        onboardingStep: session.onboardingStep,
        pathname: request.nextUrl.pathname,
      });
    }

    return session;
  } catch (error) {
    console.error("[Middleware] JWT 복호화 실패:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 라우트는 미들웨어에서 제외
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const session = await getSessionFromToken(request);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isOnboardingRoute = pathname.startsWith(ONBOARDING_PREFIX);

  // 세션이 없는 경우: 모든 페이지 접근 허용 (각 페이지에서 처리)
  if (!session) {
    return NextResponse.next();
  }

  // 세션이 있는 경우
  const isOnboardingComplete =
    session.onboardingStep === OnboardingStep.COMPLETE;

  // 1. 온보딩 미완료 → /onboarding으로 강제 리다이렉트
  if (!isOnboardingComplete && !isOnboardingRoute) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] 온보딩 미완료 -> /onboarding으로 리다이렉트", {
        currentStep: session.onboardingStep,
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
