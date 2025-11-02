"use client";

import { useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { useFileUpload } from "@/shared/lib/use-file-upload";

interface ImageUploadSectionProps {
  label: string;
  description?: string;
  value: string; // URL 또는 빈 문자열
  onChange: (url: string) => void;
  multiple?: boolean; // 여러 이미지 업로드 여부
  maxFiles?: number;
  disabled?: boolean;
}

/**
 * 이미지 업로드 섹션 컴포넌트
 * 업로드 또는 URL 입력 지원
 */
const ImageUploadSection = ({
  label,
  description,
  value,
  onChange,
  multiple = false,
  maxFiles = multiple ? 10 : 1,
  disabled = false,
}: ImageUploadSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
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
    await addFiles(selectedFiles);

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
        if (multiple) {
          // 여러 이미지인 경우 첫 번째만 사용 (추가 이미지용)
          onChange(successfulUrls[0]);
          // 나머지는 별도로 관리 필요
        } else {
          // 단일 이미지인 경우
          onChange(successfulUrls[0]);
        }
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

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUseUrlInput(false);
      setUrlInput("");
    }
  };

  const handleRemove = () => {
    onChange("");
    setUrlInput("");
    clearAllFiles();
    setUseUrlInput(false);
  };

  const isLoading = isFileUploading || isUploading;
  const hasImage = !!value;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* 이미지가 있는 경우 미리보기 */}
      {hasImage && !useUrlInput && files.length === 0 && (
        <div className="relative group">
          <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border">
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 640px"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isLoading}
              className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-600 disabled:opacity-50 text-white rounded-full p-1.5 shadow-md transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setUrlInput(value);
                setUseUrlInput(true);
              }}
              disabled={disabled}
            >
              URL 변경
            </Button>
          </div>
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

      {/* 입력 모드 선택 및 파일 업로드 */}
      {!hasImage && files.length === 0 && (
        <div className="space-y-3">
          {!useUrlInput ? (
            <div className="flex items-center gap-3">
              <label
                htmlFor={`file-upload-${label}`}
                className="flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-500 hover:text-indigo-600 text-sm font-bold rounded-full px-4 gap-1.5 h-9 cursor-pointer disabled:opacity-50"
              >
                <PlusIcon className="size-4" strokeWidth={2.75} />
                이미지 업로드
                <input
                  id={`file-upload-${label}`}
                  ref={fileInputRef}
                  type="file"
                  multiple={multiple}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={disabled || isLoading}
                />
              </label>
              <span className="text-sm text-muted-foreground">또는</span>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUseUrlInput(true)}
                disabled={disabled}
                size="sm"
              >
                URL 입력
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={disabled || isLoading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={disabled || isLoading || !urlInput.trim()}
                  size="sm"
                >
                  적용
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setUseUrlInput(false);
                    setUrlInput("");
                  }}
                  disabled={disabled}
                  size="sm"
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadSection;

