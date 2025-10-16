// app/api/encrypt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/shared/lib/crypto";
import { z } from "zod";

// Request 스키마 정의
const encryptRequestSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Request body 파싱
    const body = await request.json();

    // 유효성 검사
    const validationResult = encryptRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { text } = validationResult.data;

    // 암호화 수행
    const encrypted = encrypt(text);

    return NextResponse.json(
      {
        encrypted,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Encryption error:", error);

    return NextResponse.json(
      {
        error: "Encryption failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
