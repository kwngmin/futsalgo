"use client";

import { useNavigation } from "@/shared/hooks/use-navigation";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

const SideNav = () => {
  const { navItems, activeMenu } = useNavigation();

  return (
    <Fragment>
      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-1/2 -translate-x-[31.5rem] lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col w-full">
          {/* 로고 */}
          <Link
            className="flex items-center justify-center h-15 px-8 cursor-pointer my-1"
            type="button"
            href="/"
          >
            <Image
              src="/futsalgo_logo_italic.svg"
              alt="FutsalGo logo"
              width={130}
              height={22}
            />
          </Link>

          {/* 데스크톱 네비게이션 */}
          <div className="grow flex flex-col justify-between overflow-y-auto">
            <nav className="flex-1 px-4 mb-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`w-full flex items-center px-4 py-3 text-xl rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? "bg-slate-100 text-gray-900 font-bold"
                        : // ? "bg-blue-50 text-blue-600 font-bold"
                          "text-gray-700 hover:bg-gray-50 font-medium"
                    }`}
                    type="button"
                  >
                    <Icon
                      className="mr-4"
                      weight={isActive ? "fill" : "regular"}
                      size={28}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <nav className="flex flex-col px-4 mb-4 space-y-1">
              <Link
                href="/privacy"
                className="text-gray-700 hover:bg-gray-50 font-medium"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="text-gray-700 hover:bg-gray-50 font-medium"
              >
                이용약관
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* 태블릿 사이드바 */}
      <div className="hidden md:flex md:lg:hidden md:fixed md:inset-y-0 md:left-0 md:w-20 md:bg-white md:border-r md:border-gray-200">
        <div className="flex flex-col w-full">
          {/* 로고 */}
          <Link
            className="flex items-center justify-center h-18 cursor-pointer"
            type="button"
            href="/"
          >
            <Image
              src="/futsalgo_symbol.svg"
              alt="FUTSALGO"
              width={28}
              height={25}
            />
          </Link>

          {/* 태블릿 네비게이션 (아이콘만) */}
          <nav className="flex-1 p-2 pt-0 mb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : // ? "bg-blue-50 text-blue-600"
                        "text-gray-700 hover:bg-gray-50"
                  }`}
                  type="button"
                >
                  <Icon
                    // className="w-6 h-6"
                    size={28}
                    weight={isActive ? "fill" : "regular"}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </Fragment>
  );
};

export default SideNav;
