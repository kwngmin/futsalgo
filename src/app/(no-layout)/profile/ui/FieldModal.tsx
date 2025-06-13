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
}: {
  title: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
