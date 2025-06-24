"use client";

import { useNavigation } from "@/shared/hooks/use-navigation";

const BottomNav = () => {
  const { navItems, activeMenu, router } = useNavigation();
  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="z-20 fixed bottom-0 left-0 right-0 bg-gradient-to-b from-white/20 to-white backdrop-blur-lg sm:rounded-t-lg lg:hidden sm:max-w-xl sm:mx-auto px-0.5 sm:px-1.5 border-t border-input sm:border-l sm:border-r">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.href)}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors cursor-pointer ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`}
              type="button"
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
