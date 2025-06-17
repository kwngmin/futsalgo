"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import TeamsCreateContent from "./ui/TeamsCreateContent";

const TeamsCreatePage = () => {
  const session = useSession();
  const user = session.data?.user;

  if (!user) {
    return redirect("/");
  }

  return <TeamsCreateContent ownerId={user.id} />;
};

export default TeamsCreatePage;
