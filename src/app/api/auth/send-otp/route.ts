import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { SendOtpSchema } from "@/src/lib/validations";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = SendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const otp = String(randomInt(100000, 999999));

  // In production: store OTP in Redis with 10-min TTL and send via Resend
  // For development: log OTP to console
  console.log(`[OTP] ${parsed.data.email}: ${otp}`);

  return NextResponse.json({ ok: true });
}
