"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, IdCard, Mail, Phone, User2, X } from "lucide-react";
import { User } from "@prisma/client";
import ProfileForm from "./ProfileForm";
import { GENDER } from "@/entities/user/model/constants";
import { FieldModal } from "./FieldModal";
import ProfilePhone from "./modal/ProfilePhone";
import ProfileNickname from "./modal/ProfileNickname";
import ProfileEmail from "./modal/ProfileEmail";
import ProfileBasicForm from "./modal/ProfileBasicForm";
import { useState } from "react";
import {
  formatPhoneNumber,
  getCurrentAge,
} from "@/entities/user/model/actions";
import ProfilePhoto from "./ProfilePhoto";

export default function ProfileContent({ data }: { data: User }) {
  const router = useRouter();
  const [modalStates, setModalStates] = useState({
    nickname: false,
    email: false,
    phone: false,
    basic: false,
  });

  const age = getCurrentAge(data.birthDate as string);

  const openModal = (field: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [field]: true }));
  };

  const closeModal = (field: keyof typeof modalStates) => {
    setModalStates((prev) => ({ ...prev, [field]: false }));
  };

  const handleGoBack = () => {
    // router.back();
    router.push("/more");
  };

  const renderFieldModal = (
    field: "nickname" | "email" | "phone" | "basic",
    title: string
  ) => (
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
            {field === "nickname" ? (
              <IdCard className={`size-5 text-gray-600`} />
            ) : field === "email" ? (
              <Mail className={`size-5 text-gray-600`} />
            ) : field === "phone" ? (
              <Phone className={`size-5 text-gray-600`} />
            ) : (
              <User2 className="size-5 text-gray-600" />
            )}
            <span className="font-medium">
              {field === "basic"
                ? `${data.name || "미설정"} • ${
                    GENDER[data.gender as keyof typeof GENDER]
                  } • ${
                    data.birthDate
                      ? age.success
                        ? `${age.age}세`
                        : "생년월일 미설정"
                      : "생년월일 미설정"
                  } • ${data.height ? `${data.height}cm` : "키 미설정"}`
                : field === "phone"
                ? formatPhoneNumber(data[field] || "") || "설정되지 않음"
                : data[field] || "설정되지 않음"}
            </span>
          </div>
          <ChevronRight className="size-5 text-gray-400" />
        </div>
      }
    >
      {field === "phone" ? (
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
        <ProfileBasicForm data={data} onSuccess={() => closeModal(field)} />
      )}
    </FieldModal>
  );

  return (
    <div className="max-w-2xl mx-auto pb-16 flex flex-col">
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between h-16 shrink-0 px-4">
        {/* <Button
          variant="ghost"
          size="lg"
          onClick={handleGoBack}
          className="flex items-center gap-1.5 !px-2"
        >
          <ArrowLeft style={{ width: "24px", height: "24px" }} />
          <h1 className="text-[1.625rem] font-bold">프로필</h1>
        </Button> */}
        <h1 className="text-[1.625rem] font-bold">프로필</h1>

        <button
          className="shrink-0 size-10 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
          onClick={handleGoBack}
        >
          <X className="size-6" />
        </button>
      </div>

      <div className="space-y-3">
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
        <div className="mb-6">
          <ProfilePhoto url={data.image || undefined} userId={data.id} />
          {renderFieldModal("nickname", "닉네임")}
          {renderFieldModal("email", "이메일")}
          {renderFieldModal("phone", "전화번호")}
          {renderFieldModal("basic", "기본정보")}
        </div>

        <h3 className="text-sm font-medium mb-3 px-4 text-gray-600">
          플레이 정보
        </h3>
        {/* 플레이 정보 섹션 */}
        <ProfileForm data={data} />
      </div>
    </div>
  );
}
