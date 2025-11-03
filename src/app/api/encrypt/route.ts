// app/api/encrypt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/shared/lib/crypto";
import { validateApiKey, checkRateLimit } from "@/shared/lib/api-auth";

export async function POST(request: NextRequest) {
  // API 키 검증
  const auth = validateApiKey(request);
  if (!auth.isValid) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Rate limiting (API 키별로 제한)
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
    if (!body.text || typeof body.text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    // 암호화 수행
    const encrypted = encrypt(body.text);

    return NextResponse.json({
      success: true,
      encrypted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Encryption error:", error);
    return NextResponse.json(
      {
        error: "Encryption failed",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}

