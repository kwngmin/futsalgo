// lib/crypto.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex"); // 32바이트 hex

const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

if (!KEY) {
  throw new Error("ENCRYPTION_KEY is not set");
}

if (typeof window !== "undefined") {
  throw new Error("Crypto functions must only run on server");
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // iv + authTag + encrypted 형태로 저장
  return iv.toString("hex") + authTag.toString("hex") + encrypted;
}

export function decrypt(encryptedData: string): string {
  const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), "hex");
  const authTag = Buffer.from(
    encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2),
    "hex"
  );
  const encrypted = encryptedData.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function normalizePhone(phone: string): string {
  // 모든 비숫자 문자 제거 후 국가코드 정규화
  const digits = phone.replace(/\D/g, "");

  // 한국 전화번호 정규화
  if (digits.startsWith("82")) {
    // +82 10 1234 5678 → 01012345678
    return "0" + digits.slice(2);
  }

  if (digits.startsWith("0")) {
    // 010-1234-5678 → 01012345678
    return digits;
  }

  // 10 1234 5678 → 01012345678
  if (digits.length === 10 && !digits.startsWith("0")) {
    return "0" + digits;
  }

  return digits;
}

export function hashEmail(email: string): string {
  const normalized = normalizeEmail(email);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export function hashPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}
