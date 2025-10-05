// app/teams/[teamId]/ratings/[userId]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import dynamic from "next/dynamic";
import { getTeamMembers } from "./actions/get-team-members";

// 동적 import로 번들 크기 최적화
const TeamMemberRatingList = dynamic(
  () => import("./ui/TeamMemberRatingList"),
  {
    loading: () => (
      <div className="flex justify-center items-center py-8">로딩 중...</div>
    ),
  }
);

const TeamMemberHeader = dynamic(() => import("./ui/TeamMemberHeader"), {
  loading: () => <div className="h-16 bg-gray-100 animate-pulse rounded" />,
});

export default async function TeamRatingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const data = await getTeamMembers(id, session.user.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      <TeamMemberHeader id={id} />
      <div className="mx-4 bg-slate-100 rounded px-4 h-9 flex items-center mb-4 text-sm">
        <h1 className="text-[1.625rem] font-bold text-gray-900"></h1>
        <p className="text-gray-600">
          {data.team.name} 팀원들의 실력을 평가해주세요.
        </p>
      </div>
      <Suspense fallback={<div>로딩 중...</div>}>
        <TeamMemberRatingList
          members={data.members}
          teamId={id}
          currentUserId={session.user.id}
        />
      </Suspense>
    </div>
  );
}
