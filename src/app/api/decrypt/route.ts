// app/api/decrypt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/shared/lib/crypto";
import { validateApiKey, checkRateLimit } from "@/shared/lib/api-auth";

export async function POST(request: NextRequest) {
  // API 키 검증
  const auth = validateApiKey(request);
  if (!auth.isValid) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Rate limiting
  const apiKey = request.headers.get("x-api-key")!;
  if (!checkRateLimit(apiKey)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // 입력 검증
    if (!body.encrypted || typeof body.encrypted !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'encrypted' field" },
        { status: 400 }
      );
    }

    // 복호화 수행
    const decrypted = decrypt(body.encrypted);

    return NextResponse.json({
      success: true,
      decrypted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Decryption error:", error);

    const isAuthError =
      error instanceof Error &&
      error.message.includes(
        "Unsupported state or unable to authenticate data"
      );

    return NextResponse.json(
      {
        error: isAuthError
          ? "Invalid or corrupted encrypted data"
          : "Decryption failed",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: isAuthError ? 400 : 500 }
    );
  }
}
