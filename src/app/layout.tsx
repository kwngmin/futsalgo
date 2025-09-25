import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/shared/lib/auth";
import { SessionProviderWrapper } from "@/shared/components/providers/session-provider";
import { QueryProvider } from "@/shared/components/providers/query-provider";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/shared/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Futsalgo",
  description:
    "풋살 일정등록, 매칭, 경기 기록, 기념 사진 공유까지. 풋살 하러 Go! Futsalgo! - 우리팀 풋살 경기, 상대 팀과 한 풋살 경기! 모두 기록하고 관리 해보세요.",
};

// 모바일 확대 방지를 위한 viewport 설정
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  overflow-y-scroll`}
      >
        <Toaster position="top-center" />
        <SessionProviderWrapper session={session}>
          <QueryProvider>{children}</QueryProvider>
        </SessionProviderWrapper>
        <Analytics />
      </body>
    </html>
  );
}
