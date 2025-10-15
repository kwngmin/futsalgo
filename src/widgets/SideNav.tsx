"use client";

import { useNavigation } from "@/shared/hooks/use-navigation";
import { FileText, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useMemo } from "react";
import type { Icon } from "@phosphor-icons/react";

type NavItemType = {
  id: string;
  label: string;
  href: string;
  icon: Icon;
};

// 로고 컴포넌트 메모이제이션
const Logo = memo(({ isMobile = false }: { isMobile?: boolean }) => {
  if (isMobile) {
    return (
      <Link
        className="flex items-center justify-center h-18 cursor-pointer active:scale-95 transition-all duration-200"
        href="/"
      >
        <Image
          src="/futsalgo_symbol.svg"
          alt="FUTSALGO"
          width={32}
          height={29}
          priority
          unoptimized
        />
      </Link>
    );
  }

  return (
    <Link
      className="flex items-center justify-center h-24 px-8 cursor-pointer my-1 active:scale-95 transition-all duration-200"
      href="/"
    >
      <Image
        src="/futsalgo_logo_italic.svg"
        alt="FutsalGo logo"
        width={154}
        height={26}
        priority
        unoptimized
      />
    </Link>
  );
});

Logo.displayName = "Logo";

// 하단 링크 컴포넌트 메모이제이션
const FooterLinks = memo(({ iconOnly = false }: { iconOnly?: boolean }) => (
  <nav className={`flex flex-col ${iconOnly ? "p-2" : "px-4"} mb-4 space-y-1`}>
    <Link
      href="/privacy"
      className={`${
        iconOnly ? "p-3" : "h-10 px-2"
      } rounded-sm active:scale-98 flex items-center ${
        iconOnly ? "justify-center" : "gap-2"
      } text-gray-700 hover:bg-gray-50 font-medium`}
      aria-label="개인정보처리방침"
    >
      <Shield className="size-5 text-gray-600" />
      {!iconOnly && "개인정보처리방침"}
    </Link>
    <Link
      href="/terms"
      className={`${
        iconOnly ? "p-3" : "h-10 px-2"
      } rounded-sm active:scale-98 flex items-center ${
        iconOnly ? "justify-center" : "gap-2"
      } text-gray-700 hover:bg-gray-50 font-medium`}
      aria-label="이용약관"
    >
      <FileText className="size-5 text-gray-600" />
      {!iconOnly && "이용약관"}
    </Link>
  </nav>
));

FooterLinks.displayName = "FooterLinks";

// 네비게이션 아이템 컴포넌트 메모이제이션
const NavItem = memo(
  ({
    item,
    isActive,
    iconOnly = false,
  }: {
    item: NavItemType;
    isActive: boolean;
    iconOnly?: boolean;
  }) => {
    const IconComponent = item.icon;

    return (
      <Link
        href={item.href}
        className={`w-full flex items-center ${
          iconOnly ? "justify-center p-3" : "px-4 py-3"
        } rounded-lg transition-colors cursor-pointer active:scale-98 ${
          isActive
            ? "bg-slate-100 text-gray-900 font-bold"
            : "text-gray-700 hover:bg-gray-50 font-medium"
        } ${!iconOnly && "text-xl"}`}
      >
        <IconComponent
          className={!iconOnly ? "mr-4" : ""}
          weight={isActive ? "fill" : "regular"}
          size={28}
        />
        {!iconOnly && item.label}
      </Link>
    );
  }
);

NavItem.displayName = "NavItem";

const SideNav = () => {
  const { navItems, activeMenu } = useNavigation();

  // 네비게이션 아이템 렌더링 결과를 메모이제이션
  const desktopNavItems = useMemo(
    () =>
      navItems.map((item) => (
        <NavItem key={item.id} item={item} isActive={activeMenu === item.id} />
      )),
    [navItems, activeMenu]
  );

  const tabletNavItems = useMemo(
    () =>
      navItems.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          isActive={activeMenu === item.id}
          iconOnly
        />
      )),
    [navItems, activeMenu]
  );

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-1/2 -translate-x-[31.5rem] lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col w-full">
          <Logo />
          <div className="grow flex flex-col justify-between overflow-y-auto">
            <nav className="flex-1 px-4 mb-4 space-y-1">{desktopNavItems}</nav>
            <FooterLinks />
          </div>
        </div>
      </aside>

      {/* 태블릿 사이드바 */}
      <aside className="hidden md:flex md:lg:hidden md:fixed md:inset-y-0 md:left-0 md:w-20 md:bg-white md:border-r md:border-gray-200">
        <div className="flex flex-col w-full">
          <Logo isMobile />
          <div className="grow flex flex-col justify-between overflow-y-auto">
            <nav className="flex-1 p-2 pt-0 mb-4 space-y-1">
              {tabletNavItems}
            </nav>
            <FooterLinks iconOnly />
          </div>
        </div>
      </aside>
    </>
  );
};

export default memo(SideNav);
