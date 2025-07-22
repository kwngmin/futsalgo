import { auth } from "@/shared/lib/auth";
import NewContent from "./ui/NewContent";
import { redirect } from "next/navigation";

const NewPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    alert("로그인이 필요합니다.");
    return redirect("/");
  }

  return <NewContent userId={session.user.id} />;
};

export default NewPage;
