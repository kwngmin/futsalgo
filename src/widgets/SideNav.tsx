"use client";

import { useNavigation } from "@/shared/hooks/use-navigation";
import Image from "next/image";
import { Fragment } from "react";

const SideNav = () => {
  const { navItems, activeMenu, router } = useNavigation();
  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <Fragment>
      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col w-full">
          {/* 로고 */}
          <button
            className="flex items-center justify-center h-28 px-4 cursor-pointer"
            type="button"
            onClick={() => router.push("/")}
          >
            <Image
              src="/futsalgo_logo.svg"
              alt="FUTSALGO"
              width={127}
              height={24}
            />
          </button>

          {/* 데스크톱 네비게이션 */}
          <nav className="flex-1 px-4 mb-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.href)}
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
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 태블릿 사이드바 */}
      <div className="hidden md:flex md:lg:hidden md:fixed md:inset-y-0 md:left-0 md:w-20 md:bg-white md:border-r md:border-gray-200">
        <div className="flex flex-col w-full">
          {/* 로고 */}
          <button
            className="flex items-center justify-center h-18 cursor-pointer"
            type="button"
            onClick={() => router.push("/")}
          >
            <Image
              src="/futsalgo_symbol.svg"
              alt="FUTSALGO"
              width={28}
              height={25}
            />
          </button>

          {/* 태블릿 네비게이션 (아이콘만) */}
          <nav className="flex-1 p-2 mb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.href)}
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
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </Fragment>
  );
};

export default SideNav;
