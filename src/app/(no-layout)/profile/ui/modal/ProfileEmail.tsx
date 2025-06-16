"use client";

import { useEmailValidation } from "@/features/validation/hooks/use-validation";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Check, Loader2, X } from "lucide-react";
import { updateEmail } from "../../model/actions";

const ProfileEmail = ({
  data,
  onSuccess,
}: {
  data?: string;
  onSuccess: () => void;
}) => {
  const { email, onChange } = useEmailValidation();

  const handleClick = async () => {
    if (email.status === "valid") {
      try {
        await updateEmail(email.value);
        alert("이메일이 성공적으로 업데이트되었습니다.");
        onSuccess?.();
      } catch (error) {
        console.error("이메일 업데이트 실패:", error);
      }
    }
  };
  return (
    <div className="space-y-4">
      {data && (
        <div className="flex flex-col">
          <Label htmlFor="email">기존 이메일</Label>
          <p>{data}</p>
        </div>
      )}
      <div className="space-y-3">
        <Label htmlFor="email">새로운 이메일</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={email.value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="example@email.com"
          />
          {email.status === "checking" && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
          )}
          {email.status === "valid" && (
            <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
          )}
          {email.status === "invalid" && (
            <X className="absolute right-3 top-2.5 h-4 w-4 text-red-600" />
          )}
        </div>
        {email.error && (
          <Alert variant="destructive" className="bg-destructive/5 border-none">
            <AlertDescription>{email.error}</AlertDescription>
          </Alert>
        )}
      </div>
      <DialogFooter>
        <Button
          type="button"
          onClick={handleClick}
          disabled={email.status !== "valid"}
        >
          저장
        </Button>
      </DialogFooter>
    </div>
  );
};

export default ProfileEmail;
