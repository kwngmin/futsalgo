import { prisma } from "@/shared/lib/prisma";
import MatchContent from "./ui/MatchContent";
import { notFound } from "next/navigation";

const MatchPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  if (!id) {
    return notFound();
  }
  const schedule = await prisma.schedule.findUnique({
    where: {
      id,
    },
    select: {
      matchType: true,
    },
  });

  if (!schedule) {
    return notFound();
  }

  console.log(schedule, "schedule");

  const matches = await prisma.match.findMany({
    where: {
      scheduleId: id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!matches) {
    return notFound();
  }

  return (
    <MatchContent
      matchType={schedule.matchType}
      scheduleId={id}
      matches={matches}
    />
  );
};

export default MatchPage;
