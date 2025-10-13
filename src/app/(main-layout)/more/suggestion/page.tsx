"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Lightbulb, Upload, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import CustomSelect from "@/shared/components/ui/custom-select";
import {
  createFeedback,
  type FeedbackFormData,
} from "@/features/feedback/actions/feedback-actions";

const SuggestionPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    title: "",
    description: "",
    category: "FEATURE_REQUEST",
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleInputChange = (field: keyof FeedbackFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("제목과 설명을 모두 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      console.log("Submitting feedback:", { formData, attachments });

      const result = await createFeedback({
        ...formData,
        attachments,
      });

      console.log("Feedback result:", result);

      if (result.success) {
        alert("제안이 성공적으로 제출되었습니다.");
        router.push("/more");
      } else {
        console.error("Feedback submission failed:", result.error);
        alert(result.error || "제안 제출에 실패했습니다.");
      }
    } catch (error) {
      console.error("Suggestion submission error:", error);
      alert("제안 제출에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="p-4 text-center text-gray-500">
        제안을 하려면 로그인이 필요합니다.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* 헤더 */}
      <div className="flex items-center gap-4 px-4 h-16 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
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
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("attachments")?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                파일 선택
              </Button>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700 truncate">
                    {file.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">제안 제출 안내</p>
              <ul className="space-y-1 text-xs">
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
