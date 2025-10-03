// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { OnboardingStep } from "@prisma/client";

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

interface SessionPayload {
  id: string;
  onboardingStep: OnboardingStep;
}

async function getSessionFromToken(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      id: payload.id as string,
      onboardingStep: payload.onboardingStep as OnboardingStep,
    };
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일과 API는 빠른 경로로 처리
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromToken(request);
  const isOnboardingPage = pathname.startsWith("/onboarding");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (session) {
    const isComplete = session.onboardingStep === "COMPLETE";

    if (!isComplete && !isOnboardingPage) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (isComplete && isOnboardingPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isAuthPage) {
      return NextResponse.redirect(
        new URL(isComplete ? "/" : "/onboarding", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/(?!auth)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
