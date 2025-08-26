"use client";

import { Button } from "@/shared/components/ui/button";
import { createUploadUrl } from "@/shared/lib/cloudflare/create-upload-url";
import { uploadImage } from "@/shared/lib/cloudflare/upload-image";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useCallback } from "react";
import uploadSchedulePhotos from "../actions/upload-schedule-photos";
import { ImagesIcon } from "@phosphor-icons/react";

interface FileWithPreview {
  file: File;
  previewUrl: string;
  uploadUrl?: string;
  id: string;
}

const SchedulePhotoUpload = ({
  scheduleId,
  onUploadComplete,
}: {
  scheduleId: string;
  onUploadComplete?: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>(
    {}
  );

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // 파일 검증 함수
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "파일 크기가 10MB를 초과합니다.";
    }
    if (!file.type.startsWith("image/")) {
      return "이미지 파일만 업로드 가능합니다.";
    }
    return null;
  }, []);

  // 개별 파일 제거
  const removeFile = useCallback((fileId: string) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles.find((f) => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prevFiles.filter((f) => f.id !== fileId);
    });
  }, []);

  // 파일 선택 핸들러
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (files.length + selectedFiles.length > MAX_FILES) {
      alert(`최대 ${MAX_FILES}장까지만 업로드할 수 있습니다.`);
      return;
    }

    const validFiles: FileWithPreview[] = [];

    for (const file of selectedFiles) {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }

      // 중복 파일 체크 (파일명과 크기로 간단 체크)
      const isDuplicate = files.some(
        (existingFile) =>
          existingFile.file.name === file.name &&
          existingFile.file.size === file.size
      );

      if (isDuplicate) {
        alert(`${file.name}은 이미 선택된 파일입니다.`);
        continue;
      }

      try {
        const response = await createUploadUrl();
        if (response.success) {
          const fileWithPreview: FileWithPreview = {
            file,
            previewUrl: URL.createObjectURL(file),
            uploadUrl: response.result.uploadURL,
            id: `${file.name}-${Date.now()}-${Math.random()}`,
          };
          validFiles.push(fileWithPreview);
        } else {
          alert(`${file.name}: ${response.errors[0].message}`);
        }
      } catch (error) {
        console.error("Upload URL creation error:", error);
        alert(`${file.name}: 업로드 URL 생성에 실패했습니다.`);
      }
    }

    if (validFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    }

    // 파일 인풋 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 전체 업로드 핸들러
  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsLoading(true);
    // const uploadResults: string[] = [];
    const failedUploads: string[] = [];

    try {
      // 병렬 업로드 처리
      const uploadPromises = files.map(async (fileWithPreview) => {
        const { file, uploadUrl, id } = fileWithPreview;

        if (!uploadUrl) {
          failedUploads.push(file.name);
          return null;
        }

        try {
          setUploadProgress((prev) => ({ ...prev, [id]: true }));

          const response = await uploadImage(file, uploadUrl);

          if (response.success && response.result.variants[0]) {
            return response.result.variants[0];
          } else {
            failedUploads.push(file.name);
            return null;
          }
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
          failedUploads.push(file.name);
          return null;
        } finally {
          setUploadProgress((prev) => ({ ...prev, [id]: false }));
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const successfulUrls = uploadedUrls.filter(
        (url): url is string => url !== null
      );

      // DB에 업로드된 이미지들 저장
      if (successfulUrls.length > 0) {
        const result = await uploadSchedulePhotos({
          scheduleId,
          urls: successfulUrls,
        });

        if (result.success) {
          const successCount = successfulUrls.length;
          const failedCount = failedUploads.length;

          let message = `${successCount}장의 사진이 성공적으로 업로드되었습니다.`;
          if (failedCount > 0) {
            message += ` (${failedCount}장 실패)`;
          }
          alert(message);

          // 성공적으로 업로드된 후 전체 초기화
          clearAllFiles();

          // 부모 컴포넌트에 업로드 완료 알림
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
      setIsLoading(false);
      setUploadProgress({});
    }
  };

  // 전체 파일 초기화
  const clearAllFiles = useCallback(() => {
    files.forEach((fileWithPreview) => {
      URL.revokeObjectURL(fileWithPreview.previewUrl);
    });
    setFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [files]);

  // 파일 선택 버튼
  if (files.length === 0) {
    return (
      <div className="flex justify-between items-center py-3 min-h-14">
        <div className="flex items-center gap-2">
          <ImagesIcon weight="fill" className="size-7 text-gray-800" />
          <h2 className="text-xl font-semibold ">사진</h2>
        </div>
        <label
          htmlFor="schedule-photos"
          className="flex items-center bg-black text-white text-sm font-bold rounded-full px-3 gap-1 h-9 sm:h-8 cursor-pointer"
        >
          <Camera className="w-5 h-5 text-gray-100" />
          <span>
            업로드
            {/* {files.length === 0
        ? "사진 업로드"
        : `사진 추가 (${MAX_FILES - files.length}장 더)`} */}
          </span>
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
      <div className="flex justify-between items-center py-3 min-h-14">
        <div className="flex items-center gap-2">
          <ImagesIcon weight="fill" className="size-7 text-gray-800" />
          <h2 className="text-xl font-semibold ">사진</h2>
        </div>
        <button
          onClick={clearAllFiles}
          className="flex items-center justify-center bg-gray-100 rounded-full size-9 sm:size-8 cursor-pointer"
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
        {files.length > 0 && (
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
                선택된 파일: {files.length}/{MAX_FILES}장
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
        )}

        {files.length >= MAX_FILES && (
          <p className="text-sm text-gray-500">
            최대 {MAX_FILES}장까지 업로드할 수 있습니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default SchedulePhotoUpload;
