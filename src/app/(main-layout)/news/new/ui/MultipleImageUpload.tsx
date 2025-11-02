"use client";

import { useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Loader2, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { useFileUpload } from "@/shared/lib/use-file-upload";

interface MultipleImageUploadProps {
  label: string;
  description?: string;
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

/**
 * 여러 이미지 업로드 컴포넌트
 */
const MultipleImageUpload = ({
  label,
  description,
  imageUrls,
  onChange,
  maxFiles = 10,
  disabled = false,
}: MultipleImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    isUploading: isFileUploading,
    uploadProgress,
    addFiles,
    removeFile,
    clearAllFiles,
    uploadFiles,
  } = useFileUpload({
    maxFiles,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ["image/*"],
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const remainingSlots = maxFiles - imageUrls.length - files.length;
    
    if (selectedFiles.length > remainingSlots) {
      alert(`최대 ${maxFiles}개까지 업로드할 수 있습니다. (현재: ${imageUrls.length}개)`);
      const filesToAdd = selectedFiles.slice(0, remainingSlots);
      await addFiles(filesToAdd);
    } else {
      await addFiles(selectedFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const successfulUrls = await uploadFiles();

      if (successfulUrls.length > 0) {
        onChange([...imageUrls, ...successfulUrls]);
        clearAllFiles();
      } else {
        alert("이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const isLoading = isFileUploading || isUploading;
  const canAddMore = imageUrls.length + files.length < maxFiles;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* 업로드된 이미지들 */}
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full aspect-square">
                <Image
                  src={url}
                  alt={`이미지 ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                disabled={disabled || isLoading}
                className="absolute -top-2 -right-2 bg-gray-800 hover:bg-gray-600 disabled:opacity-50 text-white rounded-full p-1 shadow-md transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 파일 선택된 경우 미리보기 */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {files.map((fileWithPreview) => (
              <div key={fileWithPreview.id} className="relative group">
                <div className="relative w-full aspect-square">
                  <Image
                    src={fileWithPreview.previewUrl}
                    alt={fileWithPreview.file.name}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  {uploadProgress[fileWithPreview.id] && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <Loader2 className="size-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(fileWithPreview.id)}
                  disabled={disabled || isLoading}
                  className="absolute -top-2 -right-2 bg-gray-800 hover:bg-gray-600 disabled:opacity-50 text-white rounded-full p-1 shadow-md transition-colors"
                >
                  <X className="size-4" />
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {fileWithPreview.file.name}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={disabled || isLoading || files.length === 0}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                `${files.length}장 업로드`
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearAllFiles}
              disabled={disabled || isLoading}
              size="sm"
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 파일 선택 버튼 */}
      {canAddMore && files.length === 0 && (
        <label
          htmlFor={`multiple-file-upload-${label}`}
          className="flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-500 hover:text-indigo-600 text-sm font-bold rounded-full px-4 gap-1.5 h-9 cursor-pointer disabled:opacity-50"
        >
          <PlusIcon className="size-4" strokeWidth={2.75} />
          이미지 추가 ({imageUrls.length}/{maxFiles})
          <input
            id={`multiple-file-upload-${label}`}
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isLoading}
          />
        </label>
      )}

      {imageUrls.length >= maxFiles && (
        <p className="text-sm text-gray-500">
          최대 {maxFiles}장까지 업로드할 수 있습니다.
        </p>
      )}
    </div>
  );
};

export default MultipleImageUpload;

