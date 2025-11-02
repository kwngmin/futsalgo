"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { createTournamentNews } from "../../actions/create-tournament-news";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import ImageUploadSection from "./ImageUploadSection";
import MultipleImageUpload from "./MultipleImageUpload";

/**
 * 대회 소식 작성 폼
 */
const NewNewsForm = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    posterUrl: "",
    imageUrls: [] as string[], // 추가 이미지들
    startDate: "",
    endDate: "",
    location: "",
    registrationDeadline: "",
    websiteUrl: "",
    registrationUrl: "",
  });

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      setError("로그인이 필요합니다");
      return;
    }

    if (!formData.title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }

    if (!formData.content.trim()) {
      setError("내용을 입력해주세요");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createTournamentNews({
        title: formData.title,
        content: formData.content,
        posterUrl: formData.posterUrl || undefined,
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        location: formData.location || undefined,
        registrationDeadline: formData.registrationDeadline || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        registrationUrl: formData.registrationUrl || undefined,
      });

      if (result.success) {
        // 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: ["tournament-news"],
        });

        alert("대회 소식이 게시되었습니다");
        router.push("/news");
        router.refresh();
      } else {
        setError(result.error || "소식 게시에 실패했습니다");
      }
    } catch (error) {
      console.error("소식 게시 실패:", error);
      setError("소식 게시 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 space-y-6 pb-16">
      {/* 에러 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 필수 필드 */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-base font-medium">
            제목 *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="대회 소식 제목을 입력해주세요"
            className="mt-1"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Label htmlFor="content" className="text-base font-medium">
            내용 *
          </Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder="대회 소식 내용을 입력해주세요"
            className="mt-1 min-h-[200px]"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      {/* 선택 필드 */}
      <div className="space-y-4">
        <ImageUploadSection
          label="포스터 이미지"
          description="메인 포스터 이미지를 업로드하거나 URL을 입력하세요"
          value={formData.posterUrl}
          onChange={(url) => handleInputChange("posterUrl", url)}
          multiple={false}
          maxFiles={1}
          disabled={isLoading}
        />

        <MultipleImageUpload
          label="추가 이미지"
          description="대회 관련 추가 이미지를 업로드하세요 (최대 10장)"
          imageUrls={formData.imageUrls}
          onChange={(urls) => setFormData((prev) => ({ ...prev, imageUrls: urls }))}
          maxFiles={10}
          disabled={isLoading}
        />

        <div>
          <Label htmlFor="location" className="text-base font-medium">
            장소
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="예: 서울시 강남구 풋살장"
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-base font-medium">
              대회 시작일
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="endDate" className="text-base font-medium">
              대회 종료일
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className="mt-1"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="registrationDeadline" className="text-base font-medium">
            참가 신청 마감일
          </Label>
          <Input
            id="registrationDeadline"
            type="date"
            value={formData.registrationDeadline}
            onChange={(e) =>
              handleInputChange("registrationDeadline", e.target.value)
            }
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="websiteUrl" className="text-base font-medium">
            대회 홈페이지 URL
          </Label>
          <Input
            id="websiteUrl"
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
            placeholder="https://example.com"
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="registrationUrl" className="text-base font-medium">
            참가 신청 링크
          </Label>
          <Input
            id="registrationUrl"
            type="url"
            value={formData.registrationUrl}
            onChange={(e) =>
              handleInputChange("registrationUrl", e.target.value)
            }
            placeholder="https://forms.naver.com/..."
            className="mt-1"
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground mt-1">
            네이버 폼 등 참가 신청 링크를 입력해주세요
          </p>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="sticky bottom-0 bg-background pt-4 pb-4 -mx-4 px-4 border-t">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              게시 중...
            </>
          ) : (
            "게시하기"
          )}
        </Button>
      </div>
    </form>
  );
};

export default NewNewsForm;

