export type ValidationStep =
  | "email"
  | "phone"
  | "nickname"
  | "profile"
  | "complete";

export type ValidationStatus = "idle" | "checking" | "valid" | "invalid";

export interface ValidationField {
  value: string;
  status: ValidationStatus;
  error?: string;
}
