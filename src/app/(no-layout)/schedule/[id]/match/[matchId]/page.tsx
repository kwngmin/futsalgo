import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

const MatchPage = async ({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) => {
  const { matchId } = await params;
  const session = await auth();
  console.log(session);

  const match = await prisma.match.findUnique({
    where: {
      id: matchId,
    },
  });

  console.log(match, "match");

  return <div>MatchPage {matchId}</div>;
};

export default MatchPage;
