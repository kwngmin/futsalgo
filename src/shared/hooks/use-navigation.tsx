"use client";

import { usePathname } from "next/navigation";
import {
  CalendarIcon,
  TShirtIcon,
  DotsThreeOutlineIcon,
  NewspaperClippingIcon,
  UserSquareIcon,
} from "@phosphor-icons/react";

export const navItems = [
  {
    id: "home",
    label: "경기일정",
    // icon: CourtBasketballIcon,
    icon: CalendarIcon,
    href: "/",
  },
  {
    id: "team",
    label: "팀",
    icon: TShirtIcon,
    href: "/teams",
  },
  {
    id: "player",
    label: "회원",
    icon: UserSquareIcon,
    // icon: AddressBookIcon,
    // icon: UserIcon,
    href: "/players",
  },
  {
    id: "board",
    label: "게시판",
    icon: NewspaperClippingIcon,
    // icon: ChatsCircleIcon,
    href: "/boards",
  },
  {
    id: "more",
    label: "더보기",
    icon: DotsThreeOutlineIcon,
    href: "/more",
  },
];
// export const navItems = [
//   {
//     id: "home",
//     label: "홈",
//     outlinedIcon: HomeIconOutline,
//     filledIcon: HomeIcon,
//     href: "/",
//   },
//   {
//     id: "team",
//     label: "팀",
//     outlinedIcon: TrophyIconOutline,
//     filledIcon: TrophyIcon,
//     href: "/teams",
//   },
//   {
//     id: "player",
//     label: "회원",
//     outlinedIcon: FaceSmileIconOutline,
//     filledIcon: FaceSmileIcon,
//     href: "/players",
//   },
//   {
//     id: "board",
//     label: "게시판",
//     outlinedIcon: ChatBubbleOvalLeftOutline,
//     filledIcon: ChatBubbleOvalLeftIcon,
//     href: "/boards",
//   },
//   {
//     id: "more",
//     label: "더보기",
//     outlinedIcon: EllipsisHorizontalOutline,
//     filledIcon: EllipsisHorizontalCircleIcon,
//     href: "/more",
//   },
// ];

/**
 * 현재 경로 기반으로 네비게이션 상태를 제공하는 커스텀 훅
 * @returns 현재 활성화된 메뉴 ID, 라우터 객체, 전체 메뉴 항목
 */
export const useNavigation = () => {
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
  };
};
