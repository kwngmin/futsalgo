"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import NewForm from "./NewForm";
// import { getTeam } from "@/features/add-schedule/model/actions/get-my-team";
// import { Team } from "@prisma/client";
import {
  getTeams,
  GetTeamsReturn,
} from "@/features/add-schedule/model/actions/get-my-teams";

const NewContent = ({ userId }: { userId: string }) => {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["myTeams", userId],
    queryFn: () => getTeams(userId) as Promise<GetTeamsReturn>,
    enabled: !!userId, // id 없으면 fetch 안 함
  });

  console.log(data, "data");

  const handleGoBack = () => {
    router.back();
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  if (data.success === false) {
    return <div>Error: {data.error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <h1 className="text-2xl font-bold">새로운 일정</h1>
        <button
          className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
          onClick={handleGoBack}
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="space-y-6">
        <NewForm teams={data.data?.teams} userId={userId} />
      </div>
    </div>
  );
};

export default NewContent;
