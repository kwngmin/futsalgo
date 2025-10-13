"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bug, Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import CustomSelect from "@/shared/components/ui/custom-select";
import {
  createBugReport,
  type BugReportFormData,
} from "@/features/bug-report/actions/bug-report-actions";
import { useFileUpload } from "@/shared/lib/use-file-upload";
import Link from "next/link";

const BugReportPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<
    Omit<BugReportFormData, "attachments">
  >({
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    browser: "",
    os: "",
    deviceType: "",
    screenSize: "",
    url: "",
    severity: "MEDIUM",
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
    acceptedTypes: ["image/*", ".txt", ".log"],
  });

  const handleInputChange = (
    field: keyof Omit<BugReportFormData, "attachments">,
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

      const result = await createBugReport({
        ...formData,
        attachmentUrls,
      });

      if (result.success) {
        alert("버그 신고가 성공적으로 제출되었습니다.");
        router.push("/more");
      } else {
        alert(result.error || "버그 신고 제출에 실패했습니다.");
      }
    } catch (error) {
      console.error("Bug report submission error:", error);
      alert("버그 신고 제출에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="p-4 text-center text-gray-500">
        버그 신고를 하려면 로그인이 필요합니다.
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
      <div className="flex justify-between items-center gap-4 px-4 h-16 shrink-0">
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button> */}
        <div className="flex items-center gap-3">
          <Bug className="size-7 text-red-500" />
          <h1 className="text-[1.625rem] font-bold">버그 신고하기</h1>
        </div>
        <Link
          href="/more"
          className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-white rounded-full transition-colors cursor-pointer"
        >
          <X className="size-6" />
        </Link>
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
              placeholder="버그의 간단한 제목을 입력해주세요"
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
              placeholder="발견한 버그에 대해 자세히 설명해주세요"
              className="mt-1 min-h-[120px]"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <CustomSelect
              label="심각도"
              value={formData.severity}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleInputChange("severity", e.target.value)
              }
              disabled={isLoading}
              options={
                <>
                  <option value="CRITICAL">치명적 (서비스 불가)</option>
                  <option value="HIGH">높음 (주요 기능 오작동)</option>
                  <option value="MEDIUM">보통 (일부 기능 오작동)</option>
                  <option value="LOW">낮음 (경미한 오류)</option>
                  <option value="TRIVIAL">사소함 (UI 깨짐 등)</option>
                </>
              }
            />
          </div>
        </div>

        {/* 재현 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">재현 정보</h3>

          <div>
            <Label htmlFor="stepsToReproduce" className="text-base font-medium">
              재현 단계
            </Label>
            <Textarea
              id="stepsToReproduce"
              value={formData.stepsToReproduce}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange("stepsToReproduce", e.target.value)
              }
              placeholder="버그를 재현하는 단계를 순서대로 적어주세요"
              className="mt-1 min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="expectedBehavior" className="text-base font-medium">
              예상 동작
            </Label>
            <Textarea
              id="expectedBehavior"
              value={formData.expectedBehavior}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange("expectedBehavior", e.target.value)
              }
              placeholder="정상적으로 동작했을 때 어떻게 되어야 하는지 설명해주세요"
              className="mt-1 min-h-[80px]"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="actualBehavior" className="text-base font-medium">
              실제 동작
            </Label>
            <Textarea
              id="actualBehavior"
              value={formData.actualBehavior}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange("actualBehavior", e.target.value)
              }
              placeholder="실제로 어떤 문제가 발생했는지 설명해주세요"
              className="mt-1 min-h-[80px]"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* 환경 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">환경 정보</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="browser" className="text-base font-medium">
                브라우저
              </Label>
              <Input
                id="browser"
                value={formData.browser}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("browser", e.target.value)
                }
                placeholder="Chrome, Safari 등"
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="os" className="text-base font-medium">
                운영체제
              </Label>
              <Input
                id="os"
                value={formData.os}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("os", e.target.value)
                }
                placeholder="Windows, macOS, iOS 등"
                className="mt-1"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustomSelect
                label="기기 유형"
                value={formData.deviceType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleInputChange("deviceType", e.target.value)
                }
                placeholder="기기 유형 선택"
                disabled={isLoading}
                options={
                  <>
                    <option value="mobile">모바일</option>
                    <option value="tablet">태블릿</option>
                    <option value="desktop">데스크톱</option>
                  </>
                }
              />
            </div>

            <div>
              <Label htmlFor="screenSize" className="text-base font-medium">
                화면 크기
              </Label>
              <Input
                id="screenSize"
                value={formData.screenSize}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("screenSize", e.target.value)
                }
                placeholder="1920x1080 등"
                className="mt-1"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="url" className="text-base font-medium">
              버그 발생 페이지 URL
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange("url", e.target.value)
              }
              placeholder="https://example.com/page"
              className="mt-1"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* 첨부파일 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">첨부파일</h3>

          <div>
            <Label htmlFor="attachments" className="text-base font-medium">
              스크린샷 또는 로그 파일
            </Label>
            <div className="mt-1">
              <input
                id="attachments"
                type="file"
                multiple
                accept="image/*,.txt,.log"
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

        {/* 제출 버튼 */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "제출 중..." : "버그 신고 제출"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BugReportPage;
