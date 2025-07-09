import SideNav from "@/widgets/SideNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

const NoLayout = async ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-dvh">
      {/* <div className="min-h-dvh bg-gray-100"> */}
      {/* 데스크톱 & 태블릿 사이드바 */}
      <SideNav />

      {/* 콘텐츠 */}
      <main className="lg:pl-20 xl:pl-72 pb-16 lg:pb-0">{children}</main>
    </div>
  );
};

export default NoLayout;
