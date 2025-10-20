"use client";

import { useNicknameValidation } from "@/features/validation/hooks/use-validation";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Check, Loader2, X } from "lucide-react";
import { updateNickname } from "../../model/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner"; // 또는 프로젝트에서 사용하는 toast 라이브러리

interface ProfileNicknameProps {
  data?: string;
  onSuccess: () => void;
}

// 무효화할 쿼리 키 목록 - DRY 원칙 적용
const QUERY_KEYS_TO_INVALIDATE = [
  "players",
  "player",
  "team",
  "schedule",
  "scheduleAttendance",
  "matchData",
] as const;

const ProfileNickname = ({ data, onSuccess }: ProfileNicknameProps) => {
  const queryClient = useQueryClient();
  const { nickname, onChange } = useNicknameValidation();
  const [isComposing, setIsComposing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 쿼리 무효화 헬퍼 함수
  const invalidateQueries = () => {
    QUERY_KEYS_TO_INVALIDATE.forEach((key) => {
      queryClient.invalidateQueries({
        queryKey: [key],
        refetchType: "all",
      });
    });
  };

  const handleUpdate = async () => {
    if (nickname.status !== "valid" || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateNickname(nickname.value);

      // toast 사용으로 더 나은 UX 제공
      toast.success("닉네임이 성공적으로 업데이트되었습니다.");

      // 쿼리 무효화
      invalidateQueries();

      onSuccess?.();
    } catch (error) {
      console.error("닉네임 업데이트 실패:", error);
      toast.error("닉네임 업데이트에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 한글 입력 처리를 위한 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 한글 조합 중이 아닐 때만 onChange 호출
    if (!isComposing) {
      onChange(e.target.value);
    }
  };

  // 한글 조합 완료 시 처리
  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>
  ) => {
    setIsComposing(false);
    // 조합이 끝난 후 최종 값으로 onChange 호출
    onChange(e.currentTarget.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // 상태에 따른 아이콘 렌더링
  const renderStatusIcon = () => {
    if (isComposing) return null; // 한글 조합 중에는 아이콘 표시 안 함

    switch (nickname.status) {
      case "checking":
        return (
          <Loader2 className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 animate-spin" />
        );
      case "valid":
        return (
          <Check className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 text-green-600" />
        );
      case "invalid":
        return (
          <X className="absolute right-3 top-4 sm:top-3.5 h-4 w-4 text-red-600" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {data && (
        <div className="flex flex-col">
          <Label htmlFor="current-nickname">기존 닉네임</Label>
          <p className="text-sm text-muted-foreground">{data}</p>
        </div>
      )}

      <div className="space-y-3">
        <Label htmlFor="nickname">새로운 닉네임</Label>
        <div className="relative">
          <Input
            id="nickname"
            type="text"
            value={nickname.value}
            onChange={handleInputChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="닉네임을 입력하세요"
            disabled={isUpdating}
            aria-invalid={nickname.status === "invalid"}
            aria-describedby={nickname.error ? "nickname-error" : undefined}
          />
          {renderStatusIcon()}
        </div>

        {nickname.error && !isComposing && (
          <Alert
            variant="destructive"
            className="bg-destructive/5 border-none"
            id="nickname-error"
          >
            <AlertDescription>{nickname.error}</AlertDescription>
          </Alert>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          onClick={handleUpdate}
          disabled={nickname.status !== "valid" || isUpdating || isComposing}
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default ProfileNickname;
