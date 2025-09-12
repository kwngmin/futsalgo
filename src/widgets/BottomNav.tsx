"use client";

import { useNavigation } from "@/shared/hooks/use-navigation";

const BottomNav = () => {
  const { navItems, activeMenu, router } = useNavigation();
  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="z-20 fixed bottom-1 mx-4 left-0 right-0 bg-gradient-to-b from-transparent to-white backdrop-blur-lg rounded-lg md:hidden sm:max-w-xl sm:mx-auto px-0.5 sm:px-1.5 inset-shadow-sm inset-shadow-gray-300/50 shadow-lg">
      <div className="flex my-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.href)}
              className={`h-16 flex-1 flex flex-col justify-center items-center py-2 px-1 transition-colors cursor-pointer ${
                // isActive ? "text-gray-700" : "text-neutral-400"
                // isActive ? "text-blue-600" : "text-gray-700"
                isActive ? "text-gray-900" : "text-gray-700"
              }`}
              type="button"
            >
              <Icon
                className="mb-0.5"
                // className="mb-1 mt-0.5"
                // className="w-6 h-6 mb-1"
                // weight="fill"
                size={24}
                weight={isActive ? "fill" : "regular"}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
