"use client";

import { useNavigation } from "@/shared/hooks/use-navigation";

const BottomNav = () => {
  const { navItems, activeMenu, router } = useNavigation();
  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="z-20 fixed bottom-6 mx-4 left-0 right-0 bg-gradient-to-b from-white/40 to-white backdrop-blur-xl rounded-2xl md:hidden sm:max-w-lg sm:mx-auto px-2 inset-shadow-sm inset-shadow-white shadow-lg border border-gray-600 overflow-hidden">
      <div className="flex my-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.href)}
              className={`h-20 flex-1 flex flex-col justify-center items-center py-2 px-1 transition-colors cursor-pointer hover:bg-gray-50 group gap-1 ${
                // isActive ? "text-gray-700" : "text-neutral-400"
                // isActive ? "text-blue-600" : "text-gray-700"
                isActive ? "text-black" : "text-gray-700"
              }`}
              type="button"
            >
              <Icon
                className="my-1 size-7 group-active:scale-125 transition-transform duration-100 ease-in-out"
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
