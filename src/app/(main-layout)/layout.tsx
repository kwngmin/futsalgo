import BottomNav from "../../widgets/BottomNav";
import SideNav from "@/widgets/SideNav";
import { NavigationLoading } from "@/shared/components/ui/navigation-loading";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = async ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-dvh">
      {/* 네비게이션 로딩 인디케이터 */}
      <NavigationLoading />

      {/* <div className="min-h-dvh bg-gray-100"> */}
      {/* 데스크톱 & 태블릿 사이드바 */}
      <SideNav />

      {/* 콘텐츠 */}
      <main className="md:pl-20 lg:pl-72 pb-28 md:pb-0">{children}</main>

      {/* 모바일 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
