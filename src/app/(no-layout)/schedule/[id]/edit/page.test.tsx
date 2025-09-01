import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import EditScheduleContent from "./ui/EditScheduleContent";

const EditSchedulePage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    alert("로그인이 필요합니다.");
    return redirect("/");
  }

  return <EditScheduleContent userId={session.user.id} />;
};

export default EditSchedulePage;
