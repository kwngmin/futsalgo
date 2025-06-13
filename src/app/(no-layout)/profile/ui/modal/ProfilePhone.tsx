"use client";

import { Label } from "@/shared/components/ui/label";
import { DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { usePhoneValidation } from "@/features/validation/hooks/use-validation";
import { Check, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { formatPhoneNumber } from "../ProfileContent";
import { updatePhone } from "../../model/actions";

const ProfilePhone = ({
  data,
  onSuccess,
}: {
  data?: string;
  onSuccess: () => void;
}) => {
  const { phone, onChange } = usePhoneValidation();

  const handleClick = async () => {
    if (phone.status === "valid") {
      try {
        await updatePhone(phone.value);
        alert("전화번호가 성공적으로 업데이트되었습니다.");
        onSuccess?.();
      } catch (error) {
        console.error("전화번호 업데이트 실패:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {data && (
        <div className="flex flex-col">
          <Label htmlFor="phone">기존 전화번호</Label>
          <p>{formatPhoneNumber(data)}</p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="phone">새로운 전화번호</Label>
        <div className="relative">
          <Input
            id="phone"
            type="tel"
            value={phone.value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="'-' 없이 입력해주세요 (ex. 01012345678)"
          />
          {phone.status === "checking" && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
          )}
          {phone.status === "valid" && (
            <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
          )}
          {phone.status === "invalid" && (
            <X className="absolute right-3 top-2.5 h-4 w-4 text-red-600" />
          )}
        </div>

        {phone.error && (
          <Alert variant="destructive" className="bg-destructive/5 border-none">
            <AlertDescription>{phone.error}</AlertDescription>
          </Alert>
        )}
      </div>
      <DialogFooter>
        <Button
          type="button"
          onClick={handleClick}
          disabled={phone.status !== "valid"}
        >
          저장
        </Button>
      </DialogFooter>
    </div>
  );
};

export default ProfilePhone;
