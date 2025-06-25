import { getTeam } from "@/app/(main-layout)/teams/[id]/model/actions";
import { auth } from "@/shared/lib/auth";
// import { prisma } from "@/shared/lib/prisma";
import { Loader2 } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import EditTeamContent from "./ui/EditTeamContent";
// import ProfileContent from "./ui/ProfileContent";

const EditTeamPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/");
  }

  const team = await getTeam(id);

  console.log(team, "team");

  if (!team) {
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

  if (!team.data || !team.success) {
    console.error(team.error);
    return notFound();
  }

  console.log(team, "team");

  return <EditTeamContent data={team.data} />;
};

export default EditTeamPage;
