// lib/crypto.ts
import crypto from "crypto";

// 상수 정의
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const HEX_ENCODING = "hex" as const;
const UTF8_ENCODING = "utf8" as const;

// 환경 변수 검증을 먼저 수행
if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

const KEY = Buffer.from(process.env.ENCRYPTION_KEY, HEX_ENCODING);

// 서버 사이드 실행 검증
if (typeof window !== "undefined") {
  throw new Error("Crypto functions must only run on server");
}

// 헬퍼 함수: Buffer를 hex 문자열로 변환
const bufferToHex = (buffer: Buffer): string => buffer.toString(HEX_ENCODING);

// 헬퍼 함수: hex 문자열을 Buffer로 변환
const hexToBuffer = (hex: string): Buffer => Buffer.from(hex, HEX_ENCODING);

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, UTF8_ENCODING, HEX_ENCODING);
  encrypted += cipher.final(HEX_ENCODING);

  const authTag = cipher.getAuthTag();

  // iv + authTag + encrypted 형태로 결합
  return bufferToHex(iv) + bufferToHex(authTag) + encrypted;
}

export function decrypt(encryptedData: string): string {
  // 각 부분의 시작 위치 계산
  const ivEnd = IV_LENGTH * 2;
  const authTagEnd = ivEnd + AUTH_TAG_LENGTH * 2;

  const iv = hexToBuffer(encryptedData.slice(0, ivEnd));
  const authTag = hexToBuffer(encryptedData.slice(ivEnd, authTagEnd));
  const encrypted = encryptedData.slice(authTagEnd);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, HEX_ENCODING, UTF8_ENCODING);
  decrypted += decipher.final(UTF8_ENCODING);

  return decrypted;
}

// 정규화 함수들
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  // 한국 전화번호 정규화
  if (digits.startsWith("82")) {
    return "0" + digits.slice(2);
  }

  if (digits.length === 10 && !digits.startsWith("0")) {
    return "0" + digits;
  }

  return digits;
}

// 해시 함수 - 공통 로직 추출
const createHash = (data: string): string =>
  crypto.createHash("sha256").update(data).digest(HEX_ENCODING);

export function hashEmail(email: string): string {
  return createHash(normalizeEmail(email));
}

export function hashPhone(phone: string): string {
  return createHash(normalizePhone(phone));
}
