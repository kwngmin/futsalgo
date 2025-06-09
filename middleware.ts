export { auth as middleware } from "@/shared/lib/auth";
// import { auth } from "@/shared/lib/auth";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export default async function middleware(request: NextRequest) {
//   const session = await auth();
//   const { pathname } = request.nextUrl;

//   // 공개 경로
//   const publicPaths = ["/", "/login", "/api/auth"];
//   const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

//   // 로그인하지 않은 사용자
//   if (!session && !isPublicPath) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // 로그인했지만 필수 정보가 없는 사용자 (온보딩 필요)
//   const hasCompletedOnboarding =
//     session?.user?.email && session?.user?.nickname;

//   if (session && !hasCompletedOnboarding && pathname !== "/onboarding") {
//     return NextResponse.redirect(new URL("/onboarding", request.url));
//   }

//   // 온보딩 완료한 사용자가 온보딩 페이지 접근 시
//   if (session && hasCompletedOnboarding && pathname === "/onboarding") {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
// };
