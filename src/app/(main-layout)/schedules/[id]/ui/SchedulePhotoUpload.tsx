"use client";

import { Button } from "@/shared/components/ui/button";
import { Loader2, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import uploadSchedulePhotos from "../actions/upload-schedule-photos";
import { ImagesIcon } from "@phosphor-icons/react";
import { useFileUpload } from "@/shared/lib/use-file-upload";

interface SchedulePhotoUploadProps {
  scheduleId: string;
  onUploadComplete?: () => void;
}

const SchedulePhotoUpload = ({
  scheduleId,
  onUploadComplete,
}: SchedulePhotoUploadProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    isUploading,
    uploadProgress,
    addFiles,
    removeFile,
    clearAllFiles,
    uploadFiles,
  } = useFileUpload({
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024,
    acceptedTypes: ["image/*"],
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    await addFiles(selectedFiles);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsSubmitting(true);

    try {
      const successfulUrls = await uploadFiles();

      if (successfulUrls.length > 0) {
        const result = await uploadSchedulePhotos({
          scheduleId,
          urls: successfulUrls,
        });

        if (result.success) {
          const failedCount = files.length - successfulUrls.length;
          let message = `${successfulUrls.length}장의 사진이 성공적으로 업로드되었습니다.`;
          if (failedCount > 0) {
            message += ` (${failedCount}장 실패)`;
          }
          alert(message);

          clearAllFiles();
          onUploadComplete?.();
        } else {
          alert(result.message || "DB 저장 중 오류가 발생했습니다.");
        }
      } else {
        alert("모든 파일 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "업로드에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isUploading || isSubmitting;

  if (files.length === 0) {
    return (
      <div className="flex justify-between items-center py-2 min-h-13">
        <div className="flex items-center gap-2">
          <ImagesIcon weight="fill" className="size-7 text-zinc-600" />
          <h2 className="text-xl font-semibold">사진</h2>
        </div>
        <label
          htmlFor="schedule-photos"
          className="flex items-center bg-indigo-50 hover:bg-indigo-100 text-indigo-500 hover:text-indigo-600 text-base sm:text-sm font-bold rounded-full px-3.5 sm:px-3 gap-1.5 h-9 sm:h-8 cursor-pointer"
        >
          <PlusIcon className="size-4" strokeWidth={2.75} />
          추가
          <input
            id="schedule-photos"
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center py-2 min-h-13">
        <div className="flex items-center gap-2">
          <ImagesIcon weight="fill" className="size-7 text-zinc-600" />
          <h2 className="text-xl font-semibold">사진</h2>
        </div>
        <button
          onClick={clearAllFiles}
          disabled={isLoading}
          className="flex items-center justify-center bg-gray-100 rounded-full size-9 sm:size-8 cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="p-4 flex flex-col justify-center items-center gap-4 bg-gray-50 rounded-lg mb-3">
        {/* 로딩 오버레이 */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
              <div className="text-base text-gray-700">
                사진을 업로드하는 중입니다...
              </div>
            </div>
          </div>
        )}

        {/* 선택된 파일들 미리보기 */}
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {files.map((fileWithPreview) => (
              <div key={fileWithPreview.id} className="relative group">
                <div className="relative w-full aspect-square">
                  <Image
                    src={fileWithPreview.previewUrl}
                    alt={fileWithPreview.file.name}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {uploadProgress[fileWithPreview.id] && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFile(fileWithPreview.id)}
                  disabled={isLoading}
                  className="absolute -top-2 -right-2 bg-gray-800 hover:bg-gray-600 disabled:opacity-50 text-white rounded-full p-1 shadow-md transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {fileWithPreview.file.name}
                </p>
              </div>
            ))}
          </div>

          {/* 업로드/취소 버튼 */}
          <div className="flex flex-col gap-3 items-center">
            <div className="text-sm text-gray-600">
              선택된 파일: {files.length}/10장
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleUpload}
                disabled={isLoading || files.length === 0}
                className="rounded-full px-6 font-semibold"
              >
                {isLoading ? "업로드 중..." : `${files.length}장 업로드`}
              </Button>
              <Button
                variant="outline"
                onClick={clearAllFiles}
                disabled={isLoading}
                className="rounded-full px-6 font-semibold"
              >
                전체 취소
              </Button>
            </div>
          </div>
        </div>

        {files.length >= 10 && (
          <p className="text-sm text-gray-500">
            최대 10장까지 업로드할 수 있습니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default SchedulePhotoUpload;
