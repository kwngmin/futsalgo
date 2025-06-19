"use client";

import { useNavigation } from "@/shared/hooks/use-navigation";

const BottomNav = () => {
  const { navItems, activeMenu, router } = useNavigation();
  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="z-20 fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg rounded-t-lg lg:hidden max-w-xl mx-2 sm:mx-auto px-0.5 sm:px-1.5 shadow-lg shadow-gray-300 outline outline-white">
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
