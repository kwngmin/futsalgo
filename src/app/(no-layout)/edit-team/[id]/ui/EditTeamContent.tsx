"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Flame, X } from "lucide-react";
import { Team } from "@prisma/client";
import { useState } from "react";
import { FieldModal } from "@/app/(no-layout)/more/profile/ui/FieldModal";
import EditTeamForm from "./EditTeamForm";
import EditTeamLogo from "./EditTeamLogo";

export default function EditTeamContent({
  data,
  userId,
}: {
  data: Team;
  userId: string;
}) {
  const router = useRouter();
  const [modalStates, setModalStates] = useState({
    name: false,
  });

  const openModal = (field: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [field]: true }));
  };

  const closeModal = (field: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [field]: false }));
  };

  const handleGoBack = () => {
    router.back();
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
            <Flame className="size-5 text-gray-600" />
            {/* <span className="font-medium">팀 이름</span> */}
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* <span className="font-medium">{data.name}</span> */}
            <ChevronRight className="size-5 text-gray-400" />
          </div>
        </div>
      }
    >
      <div>hihi</div>
      {/* {field === "phone" ? (
        <ProfilePhone
          data={data[field] || ""}
          onSuccess={() => closeModal(field)}
        />
      ) : field === "nickname" ? (
        <ProfileNickname
          data={data[field] || ""}
          onSuccess={() => closeModal(field)}
        />
      ) : field === "email" ? (
        <ProfileEmail
          data={data[field] || ""}
          onSuccess={() => closeModal(field)}
        />
      ) : (
        <ProfileBasicForm data={data} onSuccess={() => closeModal(field)} /> */}
      {/* )} */}
    </FieldModal>
  );

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between h-16 shrink-0 px-6">
        {/* <Button
          variant="ghost"
          size="lg"
          onClick={handleGoBack}
          className="flex items-center gap-1.5 !px-2"
        >
          <ArrowLeft style={{ width: "24px", height: "24px" }} />
          <h1 className="text-[1.625rem] font-bold">프로필</h1>
        </Button> */}
        <h1 className="text-[1.625rem] font-bold">팀 정보 수정</h1>
        <button
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
          onClick={handleGoBack}
        >
          <X className="size-6" />
        </button>
      </div>

      <div className="px-3 space-y-3">
        {/* 프로필 사진 */}
        {/* <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          <Image
            width={80}
            height={80}
            src={data.image || ""}
            alt="profile_image"
            className="w-full h-full object-cover"
          />
        </div> */}

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
