"use client";

import { ChevronRight, X } from "lucide-react";
import { Team } from "@prisma/client";
import { useState } from "react";
import { FieldModal } from "@/app/(no-layout)/more/profile/ui/FieldModal";
import EditTeamForm from "./EditTeamForm";
import EditTeamLogo from "./EditTeamLogo";
import EditTeamName from "./EditTeamName";
import Link from "next/link";
import { SignpostIcon } from "@phosphor-icons/react";

export default function EditTeamContent({
  data,
  userId,
}: {
  data: Team;
  userId: string;
}) {
  const [modalStates, setModalStates] = useState({
    name: false,
  });

  const openModal = (field: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [field]: true }));
  };

  const closeModal = (field: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [field]: false }));
  };

  const renderFieldModal = (field: "name", title: string) => (
    <FieldModal
      title={`${title} 변경`}
      open={modalStates[field]}
      onOpenChange={(open) => {
        if (!open) closeModal(field);
      }}
      trigger={
        <div
          onClick={() => openModal(field)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100"
        >
          <div className="flex items-center space-x-3">
            <SignpostIcon
              className="size-5 text-gray-600"
              // weight="fill"
              weight="bold"
            />
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">팀 이름 변경</span>
            <ChevronRight className="size-5 text-gray-400" />
          </div>
        </div>
      }
    >
      <EditTeamName
        currentName={data.name}
        teamId={data.id}
        onSuccess={() => closeModal(field)}
      />
    </FieldModal>
  );

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between h-16 shrink-0 px-6">
        <h1 className="text-[1.625rem] font-bold">팀 정보 수정</h1>
        <Link
          href={`/teams/${data.id}`}
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
        >
          <X className="size-6" />
        </Link>
      </div>

      <div className="px-3 space-y-3">
        {/* 유니크 정보 섹션 */}
        <div className="ring-2 ring-accent rounded-2xl overflow-hidden bg-white mb-6">
          <EditTeamLogo
            url={data.logoUrl || undefined}
            teamId={data.id}
            userId={userId}
          />
          {renderFieldModal("name", "팀 이름")}
        </div>

        <h3 className="text-sm font-medium mb-3 px-2 text-gray-600">
          기본 정보
        </h3>
        {/* 플레이 정보 섹션 */}
        <EditTeamForm data={data} teamId={data.id} userId={userId} />
      </div>
    </div>
  );
}
