"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 확인 다이얼로그 컴포넌트
 * @param open - 다이얼로그 열림 상태
 * @param onOpenChange - 다이얼로그 상태 변경 핸들러
 * @param title - 다이얼로그 제목
 * @param description - 다이얼로그 설명
 * @param confirmText - 확인 버튼 텍스트 (기본값: "예")
 * @param cancelText - 취소 버튼 텍스트 (기본값: "아니요")
 * @param onConfirm - 확인 버튼 클릭 핸들러
 * @param onCancel - 취소 버튼 클릭 핸들러
 * @returns 확인 다이얼로그 컴포넌트
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "예",
  cancelText = "아니요",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
