import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "lh3.googleusercontent.com", // Google 프로필 이미지
      "t1.kakaocdn.net", // 카카오 프로필 이미지
      "img1.kakaocdn.net", // 카카오 프로필 이미지
      "k.kakaocdn.net",
      "dthumb-phinf.pstatic.net", // 필요 시 네이버 등 다른 외부 도메인도 추가
    ],
  },
  // 개발 모드에서 브라우저 확장 에러 억제
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = "eval-source-map";
    }
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
