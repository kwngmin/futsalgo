import { Alert, AlertDescription } from "./alert";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const CustomRadioGroup = ({
  name,
  options,
  value,
  onValueChange,
  error,
  direction = "horizontal",
}: {
  name?: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  direction?: "horizontal" | "vertical";
}) => (
  <>
    <RadioGroup
      className={`flex ${
        direction === "vertical" ? "flex-col" : "flex-wrap"
      } gap-2`}
      value={value}
      onValueChange={onValueChange}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center space-x-2 rounded-md px-3 pb-0.5 cursor-pointer min-w-24 border border-input h-10 pt-0.5"
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
