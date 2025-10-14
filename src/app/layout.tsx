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
  metadataBase: new URL("https://futsalgo.com"),

  title: {
    default: "Futsalgo - 풋살 일정 등록 및 경기 기록 플랫폼",
    template: "%s | Futsalgo",
  },

  description:
    "풋살 일정등록, 매칭, 경기 기록, 기념 사진 공유까지. 풋살 하러 Go! Futsalgo! - 우리팀 풋살 경기, 상대 팀과 한 풋살 경기! 모두 기록하고 관리 해보세요.",

  keywords: [
    "풋살",
    "풋살 기록",
    "풋살 매칭",
    "풋살 일정",
    "풋살 경기",
    "풋살 팀",
    "풋살 노트",
    "풋살 커뮤니티",
    "풋살 커뮤니티 웹",
    "풋살 커뮤니티 플랫폼",
    "풋살 커뮤니티 웹 플랫폼",
    "풋살 커뮤니티 서비스",
    "풋살 커뮤니티 앱",
    "풋살 커뮤니티 웹사이트",
    "풋살 커뮤니티 웹앱",
    "Futsal",
    "Futsalgo",
  ],

  authors: [{ name: "Futsalgo Team" }],

  creator: "Futsalgo",

  publisher: "Futsalgo",

  // Open Graph 설정 (페이스북, 카카오톡 등 소셜 미디어 공유)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://futsalgo.com",
    siteName: "Futsalgo",
    title: "Futsalgo - 풋살 일정등록 및 경기 기록 플랫폼",
    description:
      "풋살 일정등록, 매칭, 경기 기록, 기념 사진 공유까지. 풋살 하러 Go! Futsalgo!",
    images: [
      {
        url: "/og-image.png", // public 폴더에 1200x630 크기의 이미지 추가 필요
        width: 1200,
        height: 630,
        alt: "Futsalgo 풋살 매칭 플랫폼",
      },
    ],
  },

  // Twitter 카드 설정
  twitter: {
    card: "summary_large_image",
    title: "Futsalgo - 풋살 일정등록 및 경기 기록 플랫폼",
    description:
      "풋살 일정등록, 매칭, 경기 기록, 기념 사진 공유까지. 풋살 하러 Go! Futsalgo!",
    images: ["/og-image.png"],
    creator: "@futsalgo", // 실제 트위터 계정으로 변경
  },

  // 검색엔진 크롤러 설정
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 아이콘 설정
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

// 모바일 확대 방지를 위한 viewport 설정
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // maximumScale: 1,
  // userScalable: false,
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
