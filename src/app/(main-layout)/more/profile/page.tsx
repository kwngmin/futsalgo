import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import ProfileContent from "./ui/ProfileContent";

const ProfilePage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  console.log(user, "user");

  if (!user) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-screen">
        <div className="text-sm text-gray-500">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ width: "32px", height: "32px" }}
          />
        </div>
        <div className="text-lg">프로필 정보를 불러오는 중입니다.</div>
      </div>
    );
  }

  return <ProfileContent data={user} />;
};

export default ProfilePage;
