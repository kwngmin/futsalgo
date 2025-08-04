import { auth } from "@/shared/lib/auth";
// import { prisma } from "@/shared/lib/prisma";
// import { notFound } from "next/navigation";
import MatchContent from "./ui/MatchContent";
import { getMatchData } from "./actions/get-match-data";
import { notFound } from "next/navigation";
import { MatchDataResult } from "./model/types";

interface MatchPageParams {
  id: string;
  matchId: string;
}

interface MatchPageProps {
  params: Promise<MatchPageParams>;
}

const MatchPage = async ({ params }: MatchPageProps) => {
  const { id, matchId } = await params;

  // 인증 확인
  const session = await auth();
  console.log(session);

  // 매치 데이터 조회
  const matchData = await getMatchData(matchId, id);
  console.log(matchData, "data");

  // 데이터가 없으면 404 페이지로 리다이렉트
  if (!matchData) {
    notFound();
  }

  return <MatchContent data={matchData as MatchDataResult} />;
};

export default MatchPage;
