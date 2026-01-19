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

  // Turbopack 설정 (빈 객체로 경고 제거)
  turbopack: {
    rules: {
      // SVG를 React 컴포넌트로 변환
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // HTTPS 강제 (1년간 유효, 서브도메인 포함)
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            // XSS 공격 방지
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // 클릭재킹 방지
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // XSS 필터 활성화
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            // Referer 정보 제한
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // 권한 정책 설정
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      // Google 프로필 이미지
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      // 카카오 프로필 이미지 (https로 변경)
      ...["img1.kakaocdn.net", "t1.kakaocdn.net", "k.kakaocdn.net"].flatMap(
        (hostname) => [
          {
            protocol: "https" as const,
            hostname,
            pathname: "/**",
          },
          {
            protocol: "http" as const,
            hostname,
            pathname: "/**",
          },
        ]
      ),
      // 네이버 프로필 이미지
      ...[
        "ssl.pstatic.net",
        "phinf.pstatic.net",
        "dthumb-phinf.pstatic.net",
      ].map((hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/**",
      })),
      // 클라우드플레어 이미지
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
    ],
  },

  // webpack 설정 유지 (Turbopack 사용 시에도 fallback으로 작동)
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
