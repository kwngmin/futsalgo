import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { notFound } from "next/navigation";

const MatchPage = async ({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) => {
  const { id, matchId } = await params;
  const session = await auth();
  console.log(session);

  const match = await prisma.match.findUnique({
    where: {
      id: matchId,
    },
  });

  if (!match) {
    return notFound();
  }

  const schedule = await prisma.schedule.findUnique({
    where: {
      id,
    },
    select: {
      matches: true,
    },
  });

  if (!schedule) {
    return notFound();
  }

  const matchIndex = schedule?.matches.findIndex(
    (match) => match.id === matchId
  );

  const matchOrder = matchIndex ? matchIndex + 1 : 1;

  return <div>MatchPage {matchOrder}</div>;
};

export default MatchPage;
