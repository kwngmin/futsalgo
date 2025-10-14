import type { MetadataRoute } from "next";

/**
 * 로봇 설정
 * @returns 로봇 설정 데이터
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/_next/",
        "/admin/",
        "/private/",
        "/more/profile",
        "/schedules/new",
        "/teams/create",
        "/edit-team/",
      ],
    },
    sitemap: "https://futsalgo.com/sitemap.xml",
  };
}
