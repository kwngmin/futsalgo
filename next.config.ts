import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "lh3.googleusercontent.com", // Google 프로필 이미지
      "k.kakaocdn.net", // 카카오 프로필 이미지
      "dthumb-phinf.pstatic.net", // 필요 시 네이버 등 다른 외부 도메인도 추가
    ],
  },
};

export default nextConfig;
