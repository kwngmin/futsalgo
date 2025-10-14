import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TeamContent from "./ui/TeamContent";

/**
 * 팀 페이지 메타데이터 생성
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
    title: "팀 프로필",
    description: `풋살 팀의 프로필을 확인하고 팀원, 경기 기록, 팀 정보 등을 살펴보세요.`,
    keywords: [
      "풋살 팀",
      "풋살 팀 프로필",
      "풋살 팀원",
      "풋살 팀 정보",
      "풋살 팀 매칭",
      "풋살 팀 가입",
    ],
    openGraph: {
      title: "Futsalgo 팀 프로필",
      description: `풋살 팀의 프로필을 확인하고 팀원, 경기 기록, 팀 정보 등을 살펴보세요.`,
      url: `https://futsalgo.com/teams/${id}`,
    },
    twitter: {
      title: "Futsalgo 팀 프로필",
      description: `풋살 팀의 프로필을 확인하고 팀원, 경기 기록, 팀 정보 등을 살펴보세요.`,
    },
  };
}

const TeamPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  return <TeamContent id={id} />;
};

export default TeamPage;
