import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md fixed -translate-x-0 -translate-y-0 inset-x-4 top-5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 lg:ml-10 xl:ml-32 sm:top-1/3 sm:-translate-y-1/2">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
