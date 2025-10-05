import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    // 프로덕션에서 console.log 제거
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 성능 최적화 설정
  experimental: {
    // 페이지 로딩 성능 향상
    optimizePackageImports: ["@phosphor-icons/react", "lucide-react"],
  },

  // 정적 최적화 설정
  output: "standalone",

  images: {
    remotePatterns: [
      {
        // Google 프로필 이미지
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "t1.kakaocdn.net",
        pathname: "/**",
      },
      {
        // 카카오 프로필 이미지
        protocol: "http",
        hostname: "img1.kakaocdn.net",
        pathname: "/**",
      },
      {
        // 카카오 프로필 이미지
        protocol: "http",
        hostname: "k.kakaocdn.net",
        pathname: "/**",
      },
      {
        // 네이버 프로필 이미지
        protocol: "https",
        hostname: "ssl.pstatic.net",
        pathname: "/**",
      },
      {
        // 필요 시 네이버 등 다른 외부 도메인도 추가
        protocol: "https",
        hostname: "dthumb-phinf.pstatic.net",
        pathname: "/**",
      },
      {
        // 클라우드플레어 이미지 도메인
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
    ],
  },
  // 개발 모드에서 브라우저 확장 에러 억제
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
