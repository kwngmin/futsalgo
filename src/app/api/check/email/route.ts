import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { hashEmail } from "@/shared/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "이메일이 필요합니다" },
        { status: 400 }
      );
    }

    const emailHashValue = hashEmail(email);

    const existingUser = await prisma.user.findUnique({
      where: { emailHash: emailHashValue },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
