import {
  Users,
  Shirt,
  MoreHorizontal,
  MessageCircleMore,
  Volleyball,
} from "lucide-react";
import NavigationClient from "./ui/NavigationClient";
import { headers } from "next/headers";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = async ({ children }: MainLayoutProps) => {
  // 서버에서 현재 경로 가져오기
  const headersList = headers();
  const pathname = (await headersList).get("x-pathname") || "/teams";

  // 현재 경로에서 활성 탭 결정
  const getActiveTab = (path: string) => {
    if (path.startsWith("/matches")) return "match";
    if (path.startsWith("/")) return "team";
    if (path.startsWith("/players")) return "player";
    if (path.startsWith("/boards")) return "board";
    if (path.startsWith("/more")) return "more";
    return "team"; // 기본값
  };

  const activeTab = getActiveTab(pathname);

  // 내비게이션 메뉴 정의
  const navItems = [
    { id: "match", label: "경기", icon: Volleyball, href: "/matches" },
    { id: "team", label: "팀", icon: Shirt, href: "/" },
    { id: "player", label: "선수", icon: Users, href: "/players" },
    { id: "board", label: "게시판", icon: MessageCircleMore, href: "/boards" },
    { id: "more", label: "더보기", icon: MoreHorizontal, href: "/more" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 데스크톱 사이드바 */}
      <div className="hidden xl:flex xl:fixed xl:inset-y-0 xl:left-0 xl:w-72 xl:bg-white xl:border-r xl:border-gray-200">
        <div className="flex flex-col w-full">
          {/* 로고 */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Football</h1>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <NavigationClient
                  key={item.id}
                  href={item.href}
                  isActive={isActive}
                  className={`w-full flex items-center px-4 py-3 text-lg font-medium rounded-full transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-6 h-6 mr-4" />
                  {item.label}
                </NavigationClient>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 태블릿 사이드바 */}
      <div className="hidden lg:flex lg:xl:hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-20 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col w-full">
          {/* 로고 */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
          </div>

          {/* 태블릿 네비게이션 (아이콘만) */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <NavigationClient
                  key={item.id}
                  href={item.href}
                  isActive={isActive}
                  className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-6 h-6" />
                </NavigationClient>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 콘텐츠 */}
      <main className="lg:pl-20 xl:pl-72 pb-16 lg:pb-0">{children}</main>

      {/* 모바일 하단 네비게이션 */}
      <nav className="fixed bottom-2 left-0 right-0 bg-white/50 backdrop-blur-sm rounded-lg lg:hidden max-w-xl mx-2 sm:mx-auto px-0.5 sm:px-1.5 shadow-xs">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <NavigationClient
                key={item.id}
                href={item.href}
                isActive={isActive}
                className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavigationClient>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
