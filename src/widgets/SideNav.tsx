"use client";

import { useNavigation } from "@/shared/hooks/use-navigation";
import { Fragment } from "react";

const SideNav = () => {
  const { navItems, activeMenu, router } = useNavigation();
  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <Fragment>
      {/* 데스크톱 사이드바 */}
      <div className="hidden xl:flex xl:fixed xl:inset-y-0 xl:left-0 xl:w-72 xl:bg-white xl:border-r xl:border-gray-200">
        <div className="flex flex-col w-full">
          {/* 로고 */}
          <div className="flex items-center justify-center h-24 px-4">
            <h1 className="text-2xl font-black tracking-tighter">FUTSALGO</h1>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="flex-1 px-4 mb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.href)}
                  className={`w-full flex items-center px-4 py-3 text-xl font-semibold rounded-full transition-colors cursor-pointer ${
                    isActive
                      ? "bg-gray-100 text-gray-900 font-bold"
                      : // ? "bg-blue-50 text-blue-600 font-bold"
                        "text-gray-700 hover:bg-gray-50"
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
      <div className="hidden lg:flex lg:xl:hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-20 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col w-full">
          {/* 로고 */}
          <div className="flex items-center justify-center h-16">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-black text-sm">F</span>
            </div>
          </div>

          {/* 태블릿 네비게이션 (아이콘만) */}
          <nav className="flex-1 px-2 py-4 space-y-1">
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
