"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import NewForm from "./NewForm";
import { getMyTeam } from "@/features/add-schedule/model/actions/get-my-team";

const NewContent = ({ id, code }: { id: string; code: string }) => {
  const router = useRouter();
  console.log(code, "code");

  const { data } = useQuery({
    queryKey: ["myTeam", id],
    queryFn: () => getMyTeam(id),
    enabled: !!id, // id 없으면 fetch 안 함
  });

  console.log(data, "data");
  console.log(id, "id");

  const handleGoBack = () => {
    router.back();
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  if (data.success === false) {
    return <div>Error: {data.error}</div>;
  }

  const myTeam = data.data.teams.filter(
    (team) =>
      team.status === "APPROVED" &&
      (team.role === "OWNER" || team.role === "MANAGER")
  );
  console.log(myTeam, "myTeam");

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <h1 className="text-2xl font-bold">새로운 일정</h1>
        <button
          className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
          onClick={handleGoBack}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-6">
        <NewForm data={myTeam[0]} teamId={myTeam[0].teamId} userId={id} />
      </div>
      {/* <Popover>
        <PopoverTrigger className="fixed bottom-20 lg:bottom-6 right-6 flex items-center justify-center bg-indigo-500 rounded-full">
          <div className="size-14 flex items-center justify-center bg-indigo-500 rounded-full">
            <Plus className="size-6 text-white" />
          </div>
          <span className="hidden lg:flex text-white">일정</span>
        </PopoverTrigger>
        <PopoverContent>Place content for the popover here.</PopoverContent>
      </Popover> */}
    </div>
  );
};

export default NewContent;
