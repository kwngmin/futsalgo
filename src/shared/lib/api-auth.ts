// lib/api-auth.ts
import { NextRequest } from "next/server";

export interface AuthResult {
  isValid: boolean;
  error?: string;
  status?: number;
}

// API 키 검증 함수
export function validateApiKey(request: NextRequest): AuthResult {
  const apiKey = request.headers.get("x-api-key");
  const validApiKey = process.env.API_SECRET_KEY;

  // 환경 변수 확인
  if (!validApiKey) {
    console.error("API_SECRET_KEY is not configured in environment variables");
    return {
      isValid: false,
      error: "Server configuration error",
      status: 500,
    };
  }

  // API 키가 없는 경우
  if (!apiKey) {
    return {
      isValid: false,
      error: "API key is required",
      status: 401,
    };
  }

  // API 키가 잘못된 경우
  if (apiKey !== validApiKey) {
    return {
      isValid: false,
      error: "Invalid API key",
      status: 403,
    };
  }

  return { isValid: true };
}

// Rate limiting (선택사항)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(identifier);

  if (!userLimit || userLimit.resetTime < now) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}
