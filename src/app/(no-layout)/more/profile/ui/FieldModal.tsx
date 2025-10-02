import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { useEffect, useRef } from "react";

// 개별 필드 모달 컴포넌트 (DRY 원칙 적용)
export const FieldModal = ({
  title,
  children,
  trigger,
  open,
  onOpenChange,
}: {
  title: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && contentRef.current) {
      // 모달이 열릴 때 첫 번째 select 요소의 자동 포커스를 방지
      const timer = setTimeout(() => {
        const firstSelect = contentRef.current?.querySelector("select");
        if (firstSelect && document.activeElement === firstSelect) {
          // select에서 포커스를 제거하고 모달 자체에 포커스
          firstSelect.blur();
          contentRef.current?.focus();
        }
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md fixed -translate-x-0 -translate-y-0 inset-x-4 top-5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 lg:ml-10 xl:ml-32 sm:top-1/3 sm:-translate-y-1/2 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
