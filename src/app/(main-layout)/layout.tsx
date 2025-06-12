import BottomNav from "../../widgets/BottomNav";
import SideNav from "@/widgets/SideNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = async ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-dvh max-h-dvh overflow-y-auto bg-gray-50">
      {/* 데스크톱 & 태블릿 사이드바 */}
      <SideNav />

      {/* 콘텐츠 */}
      <main className="lg:pl-20 xl:pl-72 pb-16 lg:pb-0">{children}</main>

      {/* 모바일 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
