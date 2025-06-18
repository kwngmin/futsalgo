import { prisma } from "@/shared/lib/prisma";

const TeamContent = async ({ id }: { id: string }) => {
  const team = await prisma.team.findUnique({
    where: { id },
  });

  if (!team) {
    return (
      <div className="text-center text-gray-500 pt-10">
        존재하지 않는 팀입니다.
      </div>
    );
  }

  return <div>TeamContent {id}</div>;
};

export default TeamContent;
