"use client";

import { Button } from "@/shared/components/ui/button";
import { Loader2, RefreshCw, AlertCircle, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTeamPhotos } from "../lib/use-team-photos";
import { ImagesIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface TeamPhotosGalleryProps {
  teamId: string;
}

export const TeamPhotosGallery = ({ teamId }: TeamPhotosGalleryProps) => {
  const router = useRouter();

  const { photos, isLoading, error, hasMore, refresh, loadMore } =
    useTeamPhotos({
      teamId,
      limit: 20,
    });

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  // 이미지 클릭 핸들러 (모달 또는 확대 보기)
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  // 다음/이전 이미지 네비게이션
  const handleNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < photos.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  // 매치 정보 렌더링 함수
  const renderMatchInfo = (photo: (typeof photos)[0]) => {
    const { invitedTeam } = photo.schedule;

    const date = new Date(photo.schedule.date);
    const formattedDate = `${date.getFullYear()}.${
      date.getMonth() + 1
    }.${date.getDate()}`;

    // return `${date.toLocaleDateString("ko-KR", {
    //   month: "short",
    //   day: "numeric",
    // })} ${invitedTeam ? "친선전" : "자체전"}`;
    return `${formattedDate} • ${invitedTeam ? "친선전" : "자체전"}`;
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4 px-4">
      {/* 사진 갤러리 */}
      {photos.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            {photos.map((photo, index) => (
              <div key={photo.id}>
                {/* 업로더 정보 */}
                <div className="flex justify-between items-center h-10 select-none">
                  <div
                    className="flex items-center gap-2 shrink-0 cursor-pointer"
                    onClick={() => router.push(`/players/${photo.uploader.id}`)}
                  >
                    {photo.uploader.image ? (
                      <Image
                        src={photo.uploader.image}
                        alt={photo.uploader.name || ""}
                        width={32}
                        height={32}
                        className="size-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="sm:text-sm font-medium hover:underline underline-offset-2 cursor-pointer"
                        onClick={() =>
                          router.push(`/schedule/${photo.schedule.id}`)
                        }
                      >
                        {renderMatchInfo(photo)}
                      </span>
                      {/* <span
                        className="sm:text-sm font-medium hover:underline underline-offset-2 cursor-pointer"
                        onClick={() =>
                          router.push(`/players/${photo.uploader.id}`)
                        }
                      >
                        {photo.uploader.nickname || photo.uploader.name}
                      </span> */}
                      <span className="text-sm sm:text-xs text-gray-500 tracking-tight">
                        {/* {renderMatchInfo(photo)}
                        {" • "} */}
                        {new Date(photo.schedule.date).toLocaleDateString(
                          "ko-KR",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 ml-8"
                  onClick={() => handleImageClick(index)}
                >
                  <Image
                    src={photo.url}
                    alt={`경기 사진 ${index + 1}`}
                    fill
                    className="object-cover transition-transform"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 더 보기 버튼 */}
          {hasMore && (
            <div className="text-center">
              <Button onClick={loadMore} disabled={isLoading} variant="outline">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    로딩 중...
                  </>
                ) : (
                  "더 보기"
                )}
              </Button>
            </div>
          )}
        </div>
      ) : !isLoading ? (
        <div className="text-center min-h-[50vh] flex flex-col items-center justify-center text-gray-500">
          <ImagesIcon
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            weight="duotone"
          />
          <p className="text-lg mb-2 font-medium">사진이 없습니다.</p>
          {/* <p className="text-sm">
            팀 경기에서 업로드된 사진이 여기에 표시됩니다.
          </p> */}
        </div>
      ) : (
        <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-500">사진을 불러오는 중...</p>
        </div>
      )}

      {/* 이미지 확대 모달 */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={photos[selectedImageIndex].url}
              alt={`경기 사진 ${selectedImageIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-dvh object-contain sm:object-cover"
              onClick={(e) => e.stopPropagation()}
            />

            {/* 네비게이션 버튼 */}
            {selectedImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="fixed -left-1 top-1/2 -translate-y-1/2 backdrop-blur bg-black/30 hover:bg-black/30 rounded-full size-12 transition-colors text-white/80 text-xl font-medium overflow-hidden"
              >
                ←
              </button>
            )}

            {selectedImageIndex < photos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="fixed -right-1 top-1/2 -translate-y-1/2 backdrop-blur bg-black/30 hover:bg-black/30 rounded-full size-12 transition-colors text-white/80 text-xl font-medium overflow-hidden"
              >
                →
              </button>
            )}

            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="fixed top-2 right-2 backdrop-blur bg-black/30 hover:bg-black/30 rounded-full size-11 transition-colors text-white/80 text-xl font-medium overflow-hidden"
            >
              ✕
            </button>

            {/* 이미지 정보 */}
            <div className="fixed bottom-4 left-4 right-4 bg-black/20 text-white p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `/schedule/${photos[selectedImageIndex].schedule.id}`
                    );
                  }}
                >
                  {photos[selectedImageIndex].uploader.image ? (
                    <Image
                      src={photos[selectedImageIndex].uploader.image}
                      alt={photos[selectedImageIndex].uploader.name || ""}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <User size={16} className="text-gray-300" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium hover:underline underline-offset-2">
                      {renderMatchInfo(photos[selectedImageIndex])}
                      {/* {photos[selectedImageIndex].uploader.nickname ||
                        photos[selectedImageIndex].uploader.name} */}
                    </p>
                    <p className="text-sm text-gray-300">
                      {new Date(
                        photos[selectedImageIndex].schedule.date
                      ).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-300">
                  {selectedImageIndex + 1} / {photos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPhotosGallery;
