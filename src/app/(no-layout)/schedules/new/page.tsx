import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// 동적 import로 번들 크기 최적화
const NewScheduleContent = dynamic(() => import("./ui/NewScheduleContent"), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-8 text-center min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin mx-auto mb-4" size={48} />
        <p className="text-gray-500">데이터를 불러오는 중...</p>
      </div>
    </div>
  ),
});

const NewPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    alert("로그인이 필요합니다.");
    return redirect("/");
  }

  return <NewScheduleContent userId={session.user.id} />;
};

export default NewPage;
