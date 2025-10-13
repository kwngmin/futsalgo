"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Lightbulb, Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import CustomSelect from "@/shared/components/ui/custom-select";
import {
  createFeedback,
  type FeedbackFormData,
} from "@/features/feedback/actions/feedback-actions";
import { useFileUpload } from "@/shared/lib/use-file-upload";

const SuggestionPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<
    Omit<FeedbackFormData, "attachments">
  >({
    title: "",
    description: "",
    category: "FEATURE_REQUEST",
  });

  const {
    files,
    isUploading,
    uploadProgress,
    addFiles,
    removeFile,
    clearAllFiles,
    uploadFiles,
  } = useFileUpload({
    maxFiles: 5,
    maxFileSize: 10 * 1024 * 1024,
    acceptedTypes: ["image/*", ".pdf", ".doc", ".docx", ".txt"],
  });

  const handleInputChange = (
    field: keyof Omit<FeedbackFormData, "attachments">,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    await addFiles(selectedFiles);
    event.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("제목과 설명을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      let attachmentUrls: string[] = [];
      if (files.length > 0) {
        try {
          attachmentUrls = await uploadFiles();
        } catch (error) {
          console.error("File upload error:", error);
          alert("파일 업로드 중 오류가 발생했습니다.");
          return;
        }
      }

      const result = await createFeedback({
        ...formData,
        attachmentUrls,
      });

      if (result.success) {
        alert("제안이 성공적으로 제출되었습니다.");
        router.push("/more");
      } else {
        alert(result.error || "제안 제출에 실패했습니다.");
      }
    } catch (error) {
      console.error("Suggestion submission error:", error);
      alert("제안 제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="p-4 text-center text-gray-500">
        제안을 하려면 로그인이 필요합니다.
      </div>
    );
  }

  const isLoading = isUploading || isSubmitting;

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
            <div className="text-base text-gray-700">
              {isUploading ? "파일을 업로드하는 중입니다..." : "제출 중..."}
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center gap-4 px-4 h-16 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h1 className="text-[1.625rem] font-bold">제안하기</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 space-y-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-base font-medium">
              제목 *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange("title", e.target.value)
              }
              placeholder="제안의 간단한 제목을 입력해주세요"
              className="mt-1"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-medium">
              설명 *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange("description", e.target.value)
              }
              placeholder="제안하고 싶은 내용에 대해 자세히 설명해주세요"
              className="mt-1 min-h-[120px]"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <CustomSelect
              label="카테고리"
              value={formData.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleInputChange("category", e.target.value)
              }
              disabled={isLoading}
              options={
                <>
                  <option value="FEATURE_REQUEST">기능 제안</option>
                  <option value="IMPROVEMENT">개선 제안</option>
                  <option value="UI_UX">UI/UX 개선</option>
                  <option value="CONTENT">콘텐츠 관련</option>
                  <option value="OTHER">기타</option>
                </>
              }
            />
          </div>
        </div>

        {/* 첨부파일 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">첨부파일</h3>

          <div>
            <Label htmlFor="attachments" className="text-base font-medium">
              참고 자료 (선택사항)
            </Label>
            <div className="mt-1">
              <input
                id="attachments"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("attachments")?.click()}
                disabled={isLoading || files.length >= 5}
                className="cursor-pointer rounded-md flex justify-center items-center gap-2 px-4 h-12 sm:h-11 bg-white border border-gray-400 transition-shadow shadow-xs hover:shadow-md w-full mb-3 text-base font-medium"
              >
                <Upload className="size-5 mr-2" />
                파일 선택 ({files.length}/5)
              </Button>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((fileWithPreview) => (
                <div
                  key={fileWithPreview.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                >
                  {fileWithPreview.file.type.startsWith("image/") && (
                    <div className="relative w-12 h-12 shrink-0">
                      <Image
                        src={fileWithPreview.previewUrl}
                        alt={fileWithPreview.file.name}
                        fill
                        className="object-cover rounded"
                        sizes="48px"
                      />
                      {uploadProgress[fileWithPreview.id] && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {fileWithPreview.file.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileWithPreview.id)}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {files.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFiles}
                  disabled={isLoading}
                  className="w-full text-gray-600"
                >
                  전체 삭제
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-blue-800">
              <p className="font-semibold mb-1">제안 제출 안내</p>
              <ul className="space-y-1 text-sm">
                <li>• 제안은 검토 후 계획에 반영될 수 있습니다.</li>
                <li>• 구체적이고 명확한 설명을 작성해주세요.</li>
                <li>• 다른 사용자들에게 도움이 되는 제안을 부탁드립니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "제출 중..." : "제안 제출"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SuggestionPage;
