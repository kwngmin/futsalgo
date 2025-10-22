"use client";

import { useSession } from "next-auth/react";
import {
  LogOut,
  FileText,
  Shield,
  ChevronRight,
  Loader2,
  CircleUserRound,
  Bug,
  Lightbulb,
  Instagram,
  ExternalLink,
  Mail,
  // AppWindow,
  LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

// 상수 분리
const SUPPORT_EMAIL = "support@futsalgo.com";

// 타입 정의
interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  key: string;
  requireAuth?: boolean;
  isExternal?: boolean;
  showValue?: string;
}

interface MenuSection {
  category?: string;
  items: MenuItem[];
}

const MorePage = () => {
  const session = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const menuItems: MenuSection[] = [
    {
      items: [
        {
          icon: CircleUserRound,
          label: "프로필 수정",
          href: "/more/profile",
          key: "profile",
          requireAuth: true,
        },
      ],
    },
    {
      category: "서비스",
      items: [
        {
          icon: Instagram,
          label: "인스타그램",
          href: "https://www.instagram.com/futsalgo_official/",
          key: "instagram",
          isExternal: true,
        },
        // {
        //   icon: AppWindow,
        //   label: "서비스 소개",
        //   href: "/about",
        //   key: "about",
        //   isExternal: true,
        // },
        {
          icon: Mail,
          label: "문의하기",
          href: `mailto:${SUPPORT_EMAIL}`,
          key: "contact",
          showValue: SUPPORT_EMAIL,
        },
      ],
    },
    {
      category: "고객지원",
      items: [
        {
          icon: Lightbulb,
          label: "제안하기",
          href: "/more/suggestion",
          key: "suggestion",
          requireAuth: true,
        },
        {
          icon: Bug,
          label: "버그 신고하기",
          href: "/more/bug-report",
          key: "bug-report",
          requireAuth: true,
        },
        {
          icon: FileText,
          label: "이용약관",
          href: "/terms",
          key: "terms",
        },
        {
          icon: Shield,
          label: "개인정보처리방침",
          href: "/privacy",
          key: "privacy",
        },
      ],
    },
  ];

  // 메뉴 아이템 렌더링 함수
  const renderMenuItem = (item: MenuItem) => {
    const needsAuth = item.requireAuth && !session.data;

    return (
      <Link
        key={item.key}
        href={needsAuth ? "/login" : item.href}
        target={item.isExternal ? "_blank" : undefined}
        rel={item.isExternal ? "noopener noreferrer" : undefined}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 sm:hover:rounded-lg transition-colors cursor-pointer active:bg-gray-100"
      >
        <div className="flex items-center space-x-3">
          <item.icon className="size-6 text-gray-600" />
          <span className="font-medium">{item.label}</span>
        </div>

        {item.showValue ? (
          <span className="text-gray-500 text-sm">{item.showValue}</span>
        ) : item.isExternal ? (
          <ExternalLink className="size-5 text-gray-400" />
        ) : (
          <ChevronRight className="size-5 text-gray-400" />
        )}
      </Link>
    );
  };

  // 필터링된 메뉴 섹션
  const filteredMenuItems = menuItems.filter(
    (section) => session.data || (!session.data && section.category)
  );

  const handleLogout = () => {
    setIsLoading(true);
    signOut();
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 items-center justify-center h-40 w-60 bg-gradient-to-br from-slate-200 to-pink-50 backdrop-blur-lg rounded-lg z-50">
          <Loader2 className="w-10 h-10 animate-spin text-gray-600" />
          <div className="text-base text-muted-foreground">로딩 중입니다.</div>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <h1 className="text-[1.625rem] font-bold">더보기</h1>
      </div>

      <div className="space-y-3">
        {/* 로그인 유도 배너 */}
        {!session.data && (
          <div className="text-center py-8 bg-gray-200 rounded-2xl p-4 mx-4 mb-6">
            <h3 className="font-semibold text-gray-900">
              원활한 서비스 이용을 위해 로그인이 필요합니다
            </h3>
            <div className="flex gap-2 justify-center mt-3">
              <Link
                className="text-base bg-black text-white px-6 min-w-28 py-1.5 rounded-full font-bold cursor-pointer active:scale-95 transition-transform"
                href="/login"
              >
                로그인
              </Link>
            </div>
          </div>
        )}

        {/* 메뉴 섹션들 */}
        {filteredMenuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.category && (
              <h3 className="text-sm font-medium mb-3 px-4 text-gray-600">
                {section.category}
              </h3>
            )}
            <div className="">{section.items.map(renderMenuItem)}</div>
          </div>
        ))}

        {/* 로그아웃 버튼 */}
        {session.data && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer sm:hover:bg-red-500/5 transition-colors text-red-500 active:bg-red-500/10"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="size-5" />
              <span className="font-medium">로그아웃</span>
            </div>
          </button>
        )}

        <div className="text-sm text-gray-500 p-8 bg-gray-50 rounded-2xl text-center mt-8 mx-4 sm:mx-0">
          Copyright © 2025 FutsalGo. All Rights Reserved.
        </div>

        {/* 다음 업데이트 안내 */}
        {/* <div className="mx-4 mt-8 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 size-9 bg-white rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">🚀</span>
            </div>
            <p className="text-gray-700 text-base leading-relaxed flex-1 font-medium">
              친선전 후기가 추가 될 예정입니다.
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default MorePage;
