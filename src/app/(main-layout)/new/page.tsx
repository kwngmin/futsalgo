"use client";

import NewContent from "./ui/NewContent";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const NewPage = () => {
  const session = useSession();
  const router = useRouter();

  if (!session.data?.user?.id) {
    alert("로그인이 필요합니다.");
    return router.push("/");
  }

  return <NewContent id={session.data?.user?.id} />;
};

export default NewPage;
