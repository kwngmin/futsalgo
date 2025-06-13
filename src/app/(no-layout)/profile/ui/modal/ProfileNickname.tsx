"use client";

import { useNicknameValidation } from "@/features/validation/hooks/use-validation";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Check, Loader2, X } from "lucide-react";
import { updateNickname } from "../../model/actions";

const ProfileNickname = ({
  data,
  onSuccess,
}: {
  data?: string;
  onSuccess: () => void;
}) => {
  const { nickname, onChange } = useNicknameValidation();

  // 단계별 진행
  const handleClick = async () => {
    if (nickname.status === "valid") {
      try {
        await updateNickname(nickname.value);
        alert("닉네임이 성공적으로 업데이트되었습니다.");
        onSuccess?.();
      } catch (error) {
        console.error("닉네임 업데이트 실패:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {data && (
        <div className="flex flex-col">
          <Label htmlFor="phone">기존 닉네임</Label>
          <p>{data}</p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="nickname">새로운 닉네임</Label>
        <div className="relative">
          <Input
            id="nickname"
            type="text"
            value={nickname.value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="닉네임을 입력하세요"
          />
          {nickname.status === "checking" && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
          )}
          {nickname.status === "valid" && (
            <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
          )}
          {nickname.status === "invalid" && (
            <X className="absolute right-3 top-2.5 h-4 w-4 text-red-600" />
          )}
        </div>
        {nickname.error && (
          <Alert variant="destructive" className="bg-destructive/5 border-none">
            <AlertDescription>{nickname.error}</AlertDescription>
          </Alert>
        )}
      </div>
      <DialogFooter>
        <Button
          type="button"
          onClick={handleClick}
          disabled={nickname.status !== "valid"}
        >
          저장
        </Button>
      </DialogFooter>
    </div>
  );
};

export default ProfileNickname;
