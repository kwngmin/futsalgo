export type ValidationStatus = "idle" | "checking" | "valid" | "invalid";

export interface ValidationField {
  value: string;
  status: ValidationStatus;
  error?: string;
}
