import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlayerContent from "./ui/PlayerContent";

/**
 * 플레이어 페이지 메타데이터 생성
 * @param params - URL 파라미터
 * @returns 메타데이터 객체
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "플레이어 프로필",
    description: `풋살 플레이어의 프로필을 확인하고 실력, 경기 기록, 팀 정보 등을 살펴보세요.`,
    keywords: [
      "풋살 플레이어",
      "풋살 프로필",
      "풋살 선수",
      "풋살 실력",
      "풋살 경기 기록",
      "풋살 팀원",
    ],
    openGraph: {
      title: "Futsalgo 플레이어 프로필",
      description: `풋살 플레이어의 프로필을 확인하고 실력, 경기 기록, 팀 정보 등을 살펴보세요.`,
      url: `https://futsalgo.com/players/${id}`,
    },
    twitter: {
      title: "Futsalgo 플레이어 프로필",
      description: `풋살 플레이어의 프로필을 확인하고 실력, 경기 기록, 팀 정보 등을 살펴보세요.`,
    },
  };
}

const PlayerPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  return <PlayerContent id={id} />;
};

export default PlayerPage;
