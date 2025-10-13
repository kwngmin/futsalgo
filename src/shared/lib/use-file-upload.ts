import { useState, useCallback } from "react";
import { createUploadUrl } from "@/shared/lib/cloudflare/create-upload-url";
import { uploadImage } from "@/shared/lib/cloudflare/upload-image";

interface FileWithPreview {
  file: File;
  previewUrl: string;
  uploadUrl?: string;
  id: string;
}

interface UseFileUploadOptions {
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
}

interface UseFileUploadReturn {
  files: FileWithPreview[];
  isUploading: boolean;
  uploadProgress: Record<string, boolean>;
  addFiles: (newFiles: File[]) => Promise<void>;
  removeFile: (fileId: string) => void;
  clearAllFiles: () => void;
  uploadFiles: () => Promise<string[]>;
}

export const useFileUpload = (
  options: UseFileUploadOptions = {}
): UseFileUploadReturn => {
  const {
    maxFiles = 10,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    acceptedTypes = ["image/*"],
  } = options;

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>(
    {}
  );

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxFileSize) {
        return `파일 크기가 ${maxFileSize / (1024 * 1024)}MB를 초과합니다.`;
      }

      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          const baseType = type.replace("/*", "");
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isAccepted) {
        return "지원하지 않는 파일 형식입니다.";
      }

      return null;
    },
    [maxFileSize, acceptedTypes]
  );

  const addFiles = useCallback(
    async (newFiles: File[]) => {
      if (files.length + newFiles.length > maxFiles) {
        alert(`최대 ${maxFiles}개까지만 업로드할 수 있습니다.`);
        return;
      }

      const validFiles: FileWithPreview[] = [];

      for (const file of newFiles) {
        const error = validateFile(file);
        if (error) {
          alert(`${file.name}: ${error}`);
          continue;
        }

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
    },
    [files, maxFiles, validateFile]
  );

  const removeFile = useCallback((fileId: string) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles.find((f) => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prevFiles.filter((f) => f.id !== fileId);
    });
  }, []);

  const clearAllFiles = useCallback(() => {
    files.forEach((fileWithPreview) => {
      URL.revokeObjectURL(fileWithPreview.previewUrl);
    });
    setFiles([]);
  }, [files]);

  const uploadFiles = useCallback(async (): Promise<string[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    const failedUploads: string[] = [];

    try {
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

      if (failedUploads.length > 0) {
        console.warn("Failed uploads:", failedUploads);
      }

      return successfulUrls;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  }, [files]);

  return {
    files,
    isUploading,
    uploadProgress,
    addFiles,
    removeFile,
    clearAllFiles,
    uploadFiles,
  };
};
