"use client";

import { Button } from "@/shared/components/ui/button";
import { createUploadUrl } from "@/shared/lib/cloudflare/create-upload-url";
import { uploadImage } from "@/shared/lib/cloudflare/upload-image";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import updateProfilePhoto from "../model/actions";
import { useQueryClient } from "@tanstack/react-query";

const ProfilePhoto = ({ url, userId }: { url?: string; userId: string }) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadURL, setUploadURL] = useState<string | null>(null);

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
      const response = await uploadImage(file, uploadURL);

      if (response.success) {
        const result = await updateProfilePhoto({
          userId,
          url: response.result.variants[0],
        });
        console.log(result, "result");

        if (result.success) {
          alert("프로필 사진이 성공적으로 업데이트되었습니다.");
          queryClient.invalidateQueries({
            queryKey: ["players"],
            refetchType: "all",
          });
          queryClient.invalidateQueries({
            queryKey: ["player"],
            refetchType: "all",
          });
          queryClient.invalidateQueries({
            queryKey: ["team"],
            refetchType: "all",
          });
          queryClient.invalidateQueries({
            queryKey: ["schedule"],
            refetchType: "all",
          });
          queryClient.invalidateQueries({
            queryKey: ["scheduleAttendance"],
            refetchType: "all",
          });
          queryClient.invalidateQueries({
            queryKey: ["matchData"],
            refetchType: "all",
          });
        } else {
          alert(result.message);
        }
      }

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
      {isLoading && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 items-center justify-center h-40 w-60 bg-gradient-to-br from-slate-100 to-zinc-100 backdrop-blur-lg rounded-lg">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ width: "40px", height: "40px", color: "gray" }}
          />
          <div className="text-base text-muted-foreground">로딩 중입니다.</div>
        </div>
      )}
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
          {/* {team.name.charAt(0)} */}
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
          htmlFor="avatar"
          className="cursor-pointer rounded-full flex items-center gap-2 border border-input px-3 h-8 font-semibold"
        >
          <Camera className="size-5 text-gray-600" />
          <span className="font-medium">
            {isLoading ? "로딩중..." : "프로필 사진 변경"}
          </span>
          <input
            id="avatar"
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

export default ProfilePhoto;
