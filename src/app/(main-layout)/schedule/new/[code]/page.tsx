// "use client";

import { auth } from "@/shared/lib/auth";
import NewContent from "./ui/NewContent";
import { redirect } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";

const NewPage = async ({ params }: { params: Promise<{ code: string }> }) => {
  const { code } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    alert("로그인이 필요합니다.");
    return redirect("/");
  }

  return <NewContent id={session.user.id} code={code} />;
};

export default NewPage;
