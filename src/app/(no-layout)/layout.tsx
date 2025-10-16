import SideNav from "@/widgets/SideNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

const NoLayout = async ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-dvh flex justify-center">
      {/* <div className="min-h-dvh bg-gray-100"> */}
      {/* 데스크톱 & 태블릿 사이드바 */}
      <SideNav />

      {/* 콘텐츠 */}
      <main
        className="pb-28 md:pb-0 w-full lg:max-w-3xl"
        //  className="md:pl-20 lg:pl-72 pb-28 md:pb-0"
      >
        {children}
      </main>
    </div>
  );
};

export default NoLayout;
