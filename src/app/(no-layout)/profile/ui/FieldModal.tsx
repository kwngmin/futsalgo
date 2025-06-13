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
      <DialogContent className="sm:max-w-md fixed -translate-x-0 -translate-y-0 inset-x-4 top-4 sm:inset-x-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
        {/* <DialogContent className="sm:max-w-md data-[state=open]:slide-in-from-top-[20%] sm:data-[state=open]:slide-in-from-bottom-80"> */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
