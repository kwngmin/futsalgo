import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

// 동적 import로 번들 크기 최적화
const NewScheduleContent = dynamic(() => import("./ui/NewScheduleContent"), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      로딩 중...
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
