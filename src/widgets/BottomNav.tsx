"use client";

import { useNavigation } from "@/shared/hooks/use-navigation";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useNavigationState } from "@/shared/hooks/use-navigation-state";

const BottomNav = () => {
  const { navItems, activeMenu } = useNavigation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { setNavigating } = useNavigationState();

  /**
   * 네비게이션 클릭 핸들러 - 즉각적인 피드백 제공
   * @param href 이동할 경로
   */
  const handleNavigation = (href: string) => {
    setNavigating(true);
    startTransition(() => {
      router.push(href);
      // 네비게이션 완료 후 상태 리셋
      setTimeout(() => setNavigating(false), 300);
    });
  };

  return (
    <nav className="z-20 fixed bottom-6 mx-4 left-0 right-0 bg-gradient-to-b from-white/40 to-white backdrop-blur-xl rounded-2xl md:hidden sm:max-w-lg sm:mx-auto px-2 inset-shadow-sm inset-shadow-white shadow-lg border border-gray-600 overflow-hidden">
      <div className="flex my-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          const isPendingForThisItem = isPending && activeMenu !== item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={`h-20 flex-1 flex flex-col justify-center items-center py-2 px-1 transition-all duration-150 cursor-pointer hover:bg-gray-50 group gap-1 ${
                isActive ? "text-black" : "text-gray-700"
              } ${isPendingForThisItem ? "opacity-50" : ""}`}
              disabled={isPending}
            >
              <Icon
                className={`my-1 size-7 group-active:scale-125 transition-all duration-150 ease-out ${
                  isPendingForThisItem ? "animate-pulse" : ""
                }`}
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
