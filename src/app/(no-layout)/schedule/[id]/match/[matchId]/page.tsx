import { auth } from "@/shared/lib/auth";
// import { prisma } from "@/shared/lib/prisma";
// import { notFound } from "next/navigation";
import MatchContent from "./ui/MatchContent";
import { getMatchData } from "./actions/get-match-data";

const MatchPage = async ({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) => {
  const { id, matchId } = await params;
  const session = await auth();
  console.log(session);

  const response = await getMatchData(matchId, id);
  console.log(response, "data");

  //   return <div>MatchPage</div>;
  return <MatchContent data={response} />;
};

export default MatchPage;
