"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { DialogFooter } from "@/shared/components/ui/dialog";
import {
  ArrowLeft,
  ChevronRight,
  CircleUserRound,
  Mail,
  Phone,
  User2,
} from "lucide-react";
import { User } from "@prisma/client";
import ProfileForm from "./ProfileForm";
import { GENDER } from "@/entities/user/model/constants";
import { FieldModal } from "./FieldModal";

/**
 * 전화번호 문자열을 포맷팅해서 반환하는 함수
 * @param input 숫자로 이루어진 문자열 (ex: "01012345678")
 * @returns 포맷팅된 전화번호 문자열 (ex: "010-1234-5678")
 */
export function formatPhoneNumber(input: string): string {
  // 숫자만 필터링
  const digits = input.replace(/\D/g, "");

  if (digits.length === 10) {
    // 000-000-0000
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11) {
    // 000-0000-0000
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  // 그 외는 원본 반환
  return input;
}

// 정보 Row 컴포넌트 (재사용을 위한 분리)
const InfoRow = ({
  icon,
  // label,
  value,
  onClick,
  showChevron = false,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
}) => (
  <div
    className={`w-full flex items-center justify-between px-4 py-3 ${
      onClick ? "hover:bg-gray-50 transition-colors cursor-pointer" : ""
    } ${!isLast ? "border-b border-gray-100" : ""}`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <div className="flex flex-col">
        <span className="font-medium truncate max-w-64 overflow-hidden whitespace-nowrap">
          {value || "설정되지 않음"}
        </span>
      </div>
    </div>
    {showChevron && <ChevronRight className="w-5 h-5 text-gray-400" />}
  </div>
);

export default function ProfileContent({ data }: { data: User }) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleBasicInfoEdit = () => {
    router.push("/more/profile/basic");
  };

  const renderFieldModal = (
    field: "nickname" | "email" | "phone",
    title: string,
    placeholder: string
  ) => (
    <FieldModal
      title={`${title} 변경`}
      trigger={
        <div
          className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100 ${
            field !== "phone" ? `` : ""
          }`}
        >
          <p className="hidden">{placeholder}</p>
          <div className="flex items-center space-x-3">
            {field === "nickname" ? (
              <CircleUserRound className={`w-5 h-5 text-gray-600`} />
            ) : field === "email" ? (
              <Mail className={`w-5 h-5 text-gray-600`} />
            ) : (
              <Phone className={`w-5 h-5 text-gray-600`} />
            )}
            <span className="font-medium">
              {field === "phone"
                ? formatPhoneNumber(data[field] || "") || "설정되지 않음"
                : data[field] || "설정되지 않음"}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={field}>{title}</Label>
          {/* <Input
            {...register(field)}
            id={field}
            placeholder={placeholder}
            type={
              field === "email" ? "email" : field === "phone" ? "tel" : "text"
            }
          /> */}
          {/* {errors[field] && (
            <Alert>
              <AlertDescription>{errors[field]?.message}</AlertDescription>
            </Alert>
          )} */}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => {}}>
            저장
          </Button>
        </DialogFooter>
      </div>
    </FieldModal>
  );

  return (
    // <div className="min-h-screen bg-gray-50">
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl pb-16 flex flex-col">
      {/* 헤더 */}
      {/* <div className="bg-white border-b">
        <div className="flex items-center px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="mr-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">프로필</h1>
        </div>
      </div> */}
      {/* 상단: 제목과 검색 */}
      <div className="flex items-center justify-between h-16 shrink-0 px-3">
        <Button
          variant="ghost"
          size="lg"
          onClick={handleGoBack}
          className="flex items-center gap-1.5 !px-2"
          // className="mr-2"
        >
          <ArrowLeft
            // size={32}
            // className="h-12 w-12"
            style={{ width: "24px", height: "24px" }}
          />
          <h1 className="text-2xl font-bold">프로필</h1>
        </Button>
        <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-colors cursor-pointer">
          {/* <Search className="w-5 h-5" /> */}
        </button>
      </div>

      <div className="px-3 space-y-4">
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
        <div className="ring-2 ring-accent rounded-2xl overflow-hidden bg-white">
          <InfoRow
            icon={<User2 className="w-5 h-5 text-gray-600" />}
            label="개인정보"
            value={`${data.name || "미설정"} • ${
              GENDER[data.gender as keyof typeof GENDER]
            } • ${
              data.birthYear ? `${data.birthYear}년생` : "출생년도 미설정"
            } • ${data.height ? `${data.height}cm` : "키 미설정"}`}
            onClick={handleBasicInfoEdit}
            showChevron
            isLast
          />
          {renderFieldModal("nickname", "닉네임", "닉네임을 입력하세요")}
          {renderFieldModal("email", "이메일", "이메일을 입력하세요")}
          {renderFieldModal("phone", "전화번호", "전화번호를 입력하세요")}
        </div>

        {/* 플레이 정보 섹션 */}
        <ProfileForm data={data} />
      </div>
    </div>
  );
}
