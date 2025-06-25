"use client";

import { createUploadUrl } from "@/features/upload/model/actions";
import { Button } from "@/shared/components/ui/button";
import { Camera } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

const LogoUploader = ({ url }: { url?: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadURL, setUploadURL] = useState<string | null>(null);

  const uploadToCloudflare = async (file: File, uploadURL: string) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(uploadURL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload to Cloudflare");
    }

    return response.json();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 파일 크기 및 형식 검증
      if (selectedFile.size > 10 * 1024 * 1024) {
        // 10MB 제한
        alert("파일 크기가 10MB를 초과합니다.");
        return;
      }

      if (!selectedFile.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setFile(selectedFile);
      try {
        const response = await createUploadUrl();
        console.log(response, "response");
        if (response.success) {
          setUploadURL(response.result.uploadURL);

          // 미리보기 URL 생성
          const objectUrl = URL.createObjectURL(selectedFile);
          setPreviewUrl(objectUrl);
        } else {
          alert(response.errors[0].message);
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert(
          error instanceof Error ? error.message : "업로드에 실패했습니다."
        );
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !uploadURL) return;

    setIsLoading(true);

    try {
      const response = await uploadToCloudflare(file, uploadURL);
      console.log(response, "response");

      // 임시 파일 상태 초기화
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "업로드에 실패했습니다.");

      // 에러 시 미리보기 초기화
      if (file) {
        URL.revokeObjectURL(previewUrl || "");
        setPreviewUrl(url || null);
        setFile(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (file && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(url || null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 flex flex-col justify-center items-center gap-3">
      {previewUrl ? (
        <Image
          width={80}
          height={80}
          src={previewUrl || ""}
          alt="profile_image"
          className="size-20 object-cover rounded-full mt-2"
        />
      ) : (
        <div className="size-20 bg-gray-100 rounded-full mt-2 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {/* <ImageIcon className="size-10 text-gray-600" /> */}
        </div>
      )}
      {file ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="rounded-full flex items-center gap-2 min-w-20 font-bold"
            onClick={handleUpload}
            disabled={isLoading}
          >
            저장
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full flex items-center gap-2 min-w-20 font-semibold"
            onClick={handleCancel}
            disabled={isLoading}
          >
            취소
          </Button>
        </div>
      ) : (
        <label
          htmlFor="logo"
          className="cursor-pointer rounded-full flex items-center gap-2 border border-input px-3 h-8 font-semibold"
        >
          <Camera className="size-5 text-gray-600" />
          <span className="font-medium">
            {isLoading ? "로딩중..." : "팀 로고 변경"}
          </span>
          <input
            //   {...register("avatar")}
            id="logo"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
};

export default LogoUploader;
