"use client";

import { useNavigation } from "@/shared/hooks/use-navigation";

const BottomNav = () => {
  const { navItems, activeMenu, router } = useNavigation();
  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="z-20 fixed bottom-4 mx-4 left-0 right-0 bg-gradient-to-b from-transparent to-white backdrop-blur-md rounded-xl md:hidden sm:max-w-lg sm:mx-auto px-0.5 sm:px-1.5 inset-shadow-sm inset-shadow-gray-200/50 shadow-md">
      <div className="flex my-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.href)}
              className={`h-18 flex-1 flex flex-col justify-center items-center py-2 px-1 transition-colors cursor-pointer ${
                // isActive ? "text-gray-700" : "text-neutral-400"
                // isActive ? "text-blue-600" : "text-gray-700"
                isActive ? "text-indigo-700" : "text-gray-700"
              }`}
              type="button"
            >
              <Icon
                className="mb-1 mt-1.5 size-7"
                // className="mb-1 mt-0.5"
                // className="w-6 h-6 mb-1"
                // weight="fill"
                // size={24}
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
