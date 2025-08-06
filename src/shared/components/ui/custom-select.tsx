import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { ChevronDown } from "lucide-react";

interface TimeSelectProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: React.ReactNode;
  error?: boolean;
  hasPlaceholder?: boolean;
  isPlaceholderSelectable?: boolean;
  disabled?: boolean;
  className?: string;
  classNames?: {
    select?: string;
  };
}

const CustomSelect = ({
  label,
  value,
  onChange,
  options,
  error,
  hasPlaceholder,
  isPlaceholderSelectable = true,
  disabled = false,
  className,
  classNames,
}: TimeSelectProps) => {
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
          value={value}
          onChange={onChange}
          data-error={error}
          className={cn(
            "appearance-none text-sm h-11 sm:h-10 border border-input rounded-md px-3 data-[error=true]:outline-destructive cursor-pointer disabled:cursor-default disabled:opacity-50 disabled:pointer-events-none w-full",
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-11 sm:h-10 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            classNames?.select
          )}
          disabled={disabled}
        >
          {hasPlaceholder && (
            <option key="" value="" disabled={!isPlaceholderSelectable}>
              선택
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
