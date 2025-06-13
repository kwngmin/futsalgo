"use client";
import { useQuery } from "@tanstack/react-query";
import { getPlayer } from "../model/actions";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
// import { getUser } from "@/app/(no-layout)/profile/model/actions";

const PlayerContent = ({ id }: { id: string }) => {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayer(id),
  });
  console.log(data, "player");

  const handleGoBack = () => {
    router.back();
  };

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
          {/* <h1 className="text-2xl font-bold">{data?.data?.player.nickname}</h1> */}
        </Button>
        <button className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white rounded-full transition-colors cursor-pointer">
          {/* <Search className="w-5 h-5" /> */}
        </button>
      </div>
      {data ? (
        <div className="px-3 space-y-4">
          {/* 프로필 사진 */}
          <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <Image
              width={80}
              height={80}
              src={data?.data?.player.image ?? ""}
              alt="profile_image"
              className="w-full h-full object-cover"
            />
          </div>

          {/* 유니크 정보 섹션 */}
          {/* <div className="ring-2 ring-accent rounded-2xl overflow-hidden bg-white">
          {renderFieldModal("nickname", "닉네임")}
          {renderFieldModal("email", "이메일")}
          {renderFieldModal("phone", "전화번호")}
          {renderFieldModal("basic", "기본정보")}
        </div> */}

          <h3 className="text-sm font-medium mb-3 px-2 text-gray-600">
            플레이 정보
          </h3>
          {/* 플레이 정보 섹션 */}
          {/* <ProfileForm data={data} /> */}
        </div>
      ) : null}
    </div>
  );
};

export default PlayerContent;
