"use client";

import { usePathname, useRouter } from "next/navigation";
import { Users, Shirt, MoreHorizontal, Newspaper, Home } from "lucide-react";

export const navItems = [
  { id: "home", label: "홈", icon: Home, href: "/" },
  { id: "team", label: "팀", icon: Shirt, href: "/teams" },
  { id: "player", label: "회원", icon: Users, href: "/players" },
  { id: "board", label: "게시판", icon: Newspaper, href: "/boards" },
  { id: "more", label: "더보기", icon: MoreHorizontal, href: "/more" },
];

/**
 * 현재 경로 기반으로 네비게이션 상태를 제공하는 커스텀 훅
 * @returns 현재 활성화된 메뉴 ID, 라우터 객체, 전체 메뉴 항목
 */
export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveMenu = (path: string) => {
    const firstSegment = "/" + path.split("/")[1];
    switch (firstSegment) {
      // case "/matches":
      //   return "match";
      case "/teams":
        return "team";
      case "/players":
        return "player";
      case "/boards":
        return "board";
      case "/more":
        return "more";
      default:
        return "home";
    }
  };

  const activeMenu = getActiveMenu(pathname);

  return {
    navItems,
    activeMenu,
    router,
  };
};
