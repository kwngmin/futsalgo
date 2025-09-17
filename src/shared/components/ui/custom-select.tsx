import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { ChevronDown } from "lucide-react";
import { useRef, useCallback } from "react";

interface CustomSelectProps {
  label?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: React.ReactNode;
  error?: boolean;
  isPlaceholderSelectable?: boolean;
  disabled?: boolean;
  className?: string;
  classNames?: {
    select?: string;
  };
  placeholder?: string;
  size?: "default" | "sm";
}

const CustomSelect = ({
  label,
  value,
  onChange,
  options,
  error,
  isPlaceholderSelectable = true,
  disabled = false,
  className,
  classNames,
  size = "default",
  placeholder,
}: CustomSelectProps) => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // iOS 감지 함수
  const isIOS = useCallback(() => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }, []);

  // focus 이벤트 처리
  const handleFocus = useCallback(() => {
    if (!isIOS()) return;

    // 이전 blur 타임아웃이 있다면 취소
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
  }, [isIOS]);

  // 터치 시작 이벤트 처리
  const handleTouchStart = useCallback(() => {
    if (!isIOS()) return;

    // 다른 셀렉트박스의 blur 타임아웃 취소
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    // 현재 요소에 포커스 강제 설정
    setTimeout(() => {
      selectRef.current?.focus();
    }, 100);
  }, [isIOS]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label
          data-error={error}
          className="data-[error=true]:text-destructive"
        >
          {label}
        </Label>
      )}
      <div className="relative">
        <select
          ref={selectRef}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onTouchStart={handleTouchStart}
          data-error={error}
          className={cn(
            "appearance-none text-sm border border-input px-3",
            "data-[error=true]:outline-destructive cursor-pointer",
            "disabled:cursor-default disabled:opacity-50 disabled:pointer-events-none w-full",
            "file:text-foreground placeholder:text-muted-foreground",
            "selection:bg-primary selection:text-primary-foreground",
            "dark:bg-input/30 border-gray-400 flex min-w-0 rounded-md",
            "bg-white py-1 text-base shadow-xs transition-[color,box-shadow]",
            "outline-none file:inline-flex file:h-7 file:border-0",
            "file:bg-transparent file:text-sm file:font-medium",
            "md:text-sm focus-visible:border-ring focus-visible:ring-ring/50",
            "focus-visible:ring-[3px] aria-invalid:ring-destructive/20",
            "dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            size === "sm"
              ? "h-11 sm:h-10 md:h-9 rounded-sm"
              : "h-12 sm:h-11 rounded-md",
            classNames?.select
          )}
          disabled={disabled}
        >
          {placeholder && (
            <option key="" value="" disabled={!isPlaceholderSelectable}>
              {placeholder}
            </option>
          )}
          {options}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown
            className="size-4 opacity-70 stroke-muted-foreground"
            strokeWidth={2.5}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomSelect;
