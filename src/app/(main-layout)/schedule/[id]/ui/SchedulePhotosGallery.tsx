"use client";

import { Button } from "@/shared/components/ui/button";
import { Loader2, RefreshCw, AlertCircle, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import SchedulePhotoUpload from "./SchedulePhotoUpload";
import { useSchedulePhotos } from "../lib/use-schedule-photos";

interface SchedulePhotosGalleryProps {
  scheduleId: string;
}

export const SchedulePhotosGallery = ({
  scheduleId,
}: SchedulePhotosGalleryProps) => {
  const { photos, canUpload, isLoading, error, hasMore, refresh, loadMore } =
    useSchedulePhotos({
      scheduleId,
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

  // 업로드 완료 후 새로고침
  const handleUploadComplete = () => {
    refresh();
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
      {/* 업로드 폼 */}
      {canUpload && (
        <SchedulePhotoUpload
          scheduleId={scheduleId}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* 사진 갤러리 */}
      {photos.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            {photos.map((photo, index) => (
              <div key={photo.id} className="">
                {/* 업로더 정보 */}
                <div className="flex justify-between items-center h-10 cursor-pointer group select-none">
                  <div className="flex items-center gap-2">
                    {photo.uploader.image && (
                      <Image
                        src={photo.uploader.image}
                        alt={photo.uploader.name || ""}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <span className="sm:text-sm font-medium">
                      {photo.uploader.nickname || photo.uploader.name}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(photo.createdAt).toLocaleDateString("ko-KR")}
                  </span>
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
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg mb-2">아직 업로드된 사진이 없습니다.</p>
          {canUpload && (
            <p className="text-sm">첫 번째 사진을 업로드해보세요!</p>
          )}
        </div>
      ) : (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
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
                <div className="flex items-center gap-3">
                  {photos[selectedImageIndex].uploader.image && (
                    <Image
                      src={photos[selectedImageIndex].uploader.image}
                      alt={photos[selectedImageIndex].uploader.name || ""}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      {photos[selectedImageIndex].uploader.nickname ||
                        photos[selectedImageIndex].uploader.name}
                    </p>
                    <p className="text-sm text-gray-300">
                      {new Date(
                        photos[selectedImageIndex].createdAt
                      ).toLocaleDateString("ko-KR")}
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

export default SchedulePhotosGallery;
