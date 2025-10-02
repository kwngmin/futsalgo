// src/types/legal.ts
export interface LegalVersion {
  version: string;
  title: string;
  effectiveDate: string;
  content: string;
  changes?: string[];
}

export interface LegalMetadata {
  version: string;
  title: string;
  effectiveDate: string;
  changes?: string[];
}

export interface UserConsent {
  userId: string;
  termsVersion: string;
  privacyVersion: string;
  marketingConsent: boolean;
  agreedAt: string;
  ipAddress?: string;
}

export type LegalDocumentType = "privacy" | "terms";
