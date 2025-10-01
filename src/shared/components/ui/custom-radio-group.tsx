import { Alert, AlertDescription } from "./alert";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const CustomRadioGroup = ({
  name,
  options,
  value,
  onValueChange,
  error,
  containerClassName = "flex",
}: {
  name?: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  containerClassName?: string;
}) => (
  <>
    <RadioGroup
      className={
        containerClassName === "flex"
          ? "flex gap-1 flex-wrap"
          : containerClassName
      }
      value={value}
      onValueChange={onValueChange}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center space-x-2 rounded-md pl-3 pr-4 pb-0.5 cursor-pointer min-w-24 border border-input h-12 sm:h-11 pt-0.5 shadow-xs"
          htmlFor={name ? `${name}-${option.value}` : option.value}
        >
          <RadioGroupItem
            value={option.value}
            id={name ? `${name}-${option.value}` : option.value}
          />
          <span
            className={`text-sm leading-none font-semibold ${
              option.value === value ? "" : "text-muted-foreground"
            }`}
          >
            {option.label}
          </span>
        </label>
      ))}
    </RadioGroup>
    {error && (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}
  </>
);

export default CustomRadioGroup;
