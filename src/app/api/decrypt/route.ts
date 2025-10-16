// app/api/decrypt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/shared/lib/crypto";
import { z } from "zod";

// Request 스키마 정의
const decryptRequestSchema = z.object({
  encrypted: z.string().min(1, "Encrypted text is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Request body 파싱
    const body = await request.json();

    // 유효성 검사
    const validationResult = decryptRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { encrypted } = validationResult.data;

    // 복호화 수행
    const decrypted = decrypt(encrypted);

    return NextResponse.json(
      {
        decrypted,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Decryption error:", error);

    // 복호화 실패는 보안상 민감할 수 있으므로 상세 정보를 숨김
    const isAuthError =
      error instanceof Error &&
      error.message.includes(
        "Unsupported state or unable to authenticate data"
      );

    return NextResponse.json(
      {
        error: isAuthError ? "Invalid or corrupted data" : "Decryption failed",
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: isAuthError ? 400 : 500 }
    );
  }
}
