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
  const isSelectOpenRef = useRef(false);
  const preventBlurRef = useRef(false);

  // iOS 감지 함수
  const isIOS = useCallback(() => {
    if (typeof window === "undefined") return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }, []);

  // 컴포넌트 마운트 시 전역 이벤트 리스너 설정
  useEffect(() => {
    if (!isIOS()) return;

    const handleGlobalTouchStart = (e: TouchEvent) => {
      // 다른 select 요소를 터치하는 경우
      if (
        e.target instanceof HTMLSelectElement &&
        e.target !== selectRef.current
      ) {
        preventBlurRef.current = true;
        setTimeout(() => {
          preventBlurRef.current = false;
        }, 300);
      }
    };

    const handleGlobalMouseDown = (e: MouseEvent) => {
      // select 외부 클릭 시에만 blur 허용
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        preventBlurRef.current = false;
      }
    };

    document.addEventListener("touchstart", handleGlobalTouchStart, true);
    document.addEventListener("mousedown", handleGlobalMouseDown, true);

    return () => {
      document.removeEventListener("touchstart", handleGlobalTouchStart, true);
      document.removeEventListener("mousedown", handleGlobalMouseDown, true);
    };
  }, [isIOS]);

  // blur 이벤트 처리
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLSelectElement>) => {
      if (!isIOS()) return;

      // blur 방지 플래그가 설정되어 있으면 포커스 유지
      if (preventBlurRef.current) {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => {
          selectRef.current?.focus();
        }, 0);
        return;
      }

      // select가 열려있는 경우 blur 방지
      if (isSelectOpenRef.current) {
        e.preventDefault();
        e.stopPropagation();
        selectRef.current?.focus();
      }
    },
    [isIOS]
  );

  // focus 이벤트 처리
  const handleFocus = useCallback(() => {
    if (!isIOS()) return;
    isSelectOpenRef.current = true;
    preventBlurRef.current = true;

    // 일정 시간 후 플래그 해제
    setTimeout(() => {
      preventBlurRef.current = false;
    }, 500);
  }, [isIOS]);

  // change 이벤트 처리 - 옵션 선택 시
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      isSelectOpenRef.current = false;
      preventBlurRef.current = false;
      onChange(e);
    },
    [onChange]
  );

  // 터치 이벤트 처리
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isIOS()) return;

      // 현재 select를 터치한 경우
      preventBlurRef.current = true;
      isSelectOpenRef.current = true;

      // 포커스 강제 설정
      if (selectRef.current && document.activeElement !== selectRef.current) {
        e.preventDefault();
        selectRef.current.focus();
      }
    },
    [isIOS]
  );

  // 마우스다운 이벤트 처리 (추가 보호)
  const handleMouseDown = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_e: React.MouseEvent) => {
      if (!isIOS()) return;

      // select 클릭 시 blur 방지
      preventBlurRef.current = true;
      setTimeout(() => {
        preventBlurRef.current = false;
      }, 300);
    },
    [isIOS]
  );

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
          onBlur={handleBlur}
          onFocus={handleFocus}
          onTouchStart={handleTouchStart}
          onMouseDown={handleMouseDown}
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
