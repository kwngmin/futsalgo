"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

const TeamMemberHeader = ({ id }: { id: string }) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push(`/teams/${id}`);
  };

  return (
    <div className="flex items-center justify-between px-4 h-16 shrink-0">
      <h1 className="text-[1.625rem] font-bold">팀원 평가</h1>
      <button
        className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
        onClick={handleGoBack}
      >
        <X className="size-6" />
      </button>
    </div>
  );
};

export default TeamMemberHeader;
