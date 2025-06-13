import { Alert, AlertDescription } from "./alert";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const CustomRadioGroup = ({
  options,
  value,
  onValueChange,
  error,
}: {
  options: readonly { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
}) => (
  <>
    <RadioGroup
      className="flex flex-wrap gap-2"
      value={value}
      onValueChange={onValueChange}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center space-x-2 rounded-md px-3 pb-0.5 cursor-pointer min-w-24 border border-input h-10 pt-0.5"
          htmlFor={option.value}
        >
          <RadioGroupItem value={option.value} id={option.value} />
          <span
            className={`text-sm leading-none ${
              option.value === value ? "font-semibold" : "font-medium"
            }`}
          >
            {option.label}
          </span>
        </label>
      ))}
    </RadioGroup>
    {error && (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}
  </>
);

export default CustomRadioGroup;
