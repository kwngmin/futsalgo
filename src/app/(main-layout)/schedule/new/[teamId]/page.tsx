// "use client";

import { auth } from "@/shared/lib/auth";
import NewContent from "./ui/NewContent";
import { redirect } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";

const NewPage = async ({ params }: { params: Promise<{ teamId: string }> }) => {
  const { teamId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    alert("로그인이 필요합니다.");
    return redirect("/");
  }

  return <NewContent userId={session.user.id} hostTeamId={teamId} />;
};

export default NewPage;
