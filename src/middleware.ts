import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/shared/lib/auth";

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Auth 관련 경로 (미들웨어 체크 예외)
  const isAuthCallback = pathname.startsWith("/api/auth");
  const isOnboardingPage = pathname.startsWith("/onboarding");

  // Auth callback은 항상 통과
  if (isAuthCallback) {
    return NextResponse.next();
  }

  // 로그인한 사용자
  if (session?.user) {
    // 로그인한 사용자 온보딩 완료 여부
    const isOnboardingComplete = session.user.onboardingStep === "COMPLETE";

    // 온보딩 미완료 사용자는 무조건 온보딩 페이지로
    if (!isOnboardingComplete && !isOnboardingPage) {
      console.log("온보딩 미완료 사용자는 무조건 온보딩 페이지로 리다이렉트");
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // 온보딩 완료 사용자가 온보딩 페이지 접근 시 홈으로
    if (isOnboardingComplete && isOnboardingPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 로그인 완료 사용자가 로그인/회원가입 페이지 접근 시
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    if (isAuthPage) {
      const redirectUrl = isOnboardingComplete ? "/" : "/onboarding";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 매칭:
     * - api (API 라우트)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     * - public 폴더의 파일들
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
