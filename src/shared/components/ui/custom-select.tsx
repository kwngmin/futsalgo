import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { ChevronDown } from "lucide-react";
import { useRef, useCallback, useEffect } from "react";

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

// 전역 상태로 현재 활성화된 select 관리
let activeSelectRef: HTMLSelectElement | null = null;
const blurTimeouts = new Map<HTMLSelectElement, NodeJS.Timeout>();

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

  // iOS 감지 함수
  const isIOS = useCallback(() => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }, []);

  // 모든 blur 타임아웃 클리어
  const clearAllBlurTimeouts = useCallback(() => {
    blurTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    blurTimeouts.clear();
  }, []);

  // focus 이벤트 처리
  const handleFocus = useCallback(() => {
    if (!isIOS() || !selectRef.current) return;

    // 모든 blur 타임아웃 취소
    clearAllBlurTimeouts();

    // 현재 select를 활성화된 것으로 설정
    activeSelectRef = selectRef.current;
  }, [isIOS, clearAllBlurTimeouts]);

  // blur 이벤트 처리
  const handleBlur = useCallback(() => {
    if (!isIOS() || !selectRef.current) return;

    const currentSelect = selectRef.current;

    // 다른 select로 포커스가 이동하는 경우를 대비해 약간의 지연
    const timeoutId = setTimeout(() => {
      // 현재 활성화된 select가 이 select인 경우에만 null로 설정
      if (activeSelectRef === currentSelect) {
        activeSelectRef = null;
      }
      blurTimeouts.delete(currentSelect);
    }, 150);

    blurTimeouts.set(currentSelect, timeoutId);
  }, [isIOS]);

  // 터치 시작 이벤트 처리
  const handleTouchStart = useCallback(() => {
    if (!isIOS() || !selectRef.current) return;

    const currentSelect = selectRef.current;

    // 다른 select에서 이 select로 이동하는 경우
    if (activeSelectRef && activeSelectRef !== currentSelect) {
      // 이전 select의 blur 타임아웃 취소
      const prevTimeout = blurTimeouts.get(activeSelectRef);
      if (prevTimeout) {
        clearTimeout(prevTimeout);
        blurTimeouts.delete(activeSelectRef);
      }
    }

    // 현재 select의 blur 타임아웃도 취소
    const currentTimeout = blurTimeouts.get(currentSelect);
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      blurTimeouts.delete(currentSelect);
    }

    // 현재 select를 활성화
    activeSelectRef = currentSelect;

    // iOS에서 select 드롭다운이 제대로 열리도록 포커스 설정
    setTimeout(() => {
      if (selectRef.current && !selectRef.current.disabled) {
        selectRef.current.focus();
      }
    }, 50);
  }, [isIOS]);

  // change 이벤트 처리
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e);

      // iOS에서 선택 후에도 포커스 유지
      if (isIOS() && selectRef.current) {
        setTimeout(() => {
          selectRef.current?.focus();
        }, 50);
      }
    },
    [onChange, isIOS]
  );

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (selectRef.current) {
        const timeout = blurTimeouts.get(selectRef.current);
        if (timeout) {
          clearTimeout(timeout);
          blurTimeouts.delete(selectRef.current);
        }

        if (activeSelectRef === selectRef.current) {
          activeSelectRef = null;
        }
      }
    };
  }, []);

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
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
