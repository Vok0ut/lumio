import { NextRequest, NextResponse } from "next/server";
import { VerifyOtpSchema } from "@/src/lib/validations";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = VerifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // In production: verify OTP from Redis
  // For development: accept any 6-digit code
  const { email, code } = parsed.data;

  if (code.length !== 6) {
    return NextResponse.json({ error: "Codigo invalido" }, { status: 400 });
  }

  // TODO: In production, verify against stored OTP in Redis
  // const storedOtp = await redis.get(`otp:${email}`);
  // if (!storedOtp || storedOtp !== code) {
  //   return NextResponse.json({ error: "Codigo incorrecto o expirado" }, { status: 400 });
  // }
  // await redis.del(`otp:${email}`);

  return NextResponse.json({ ok: true, email });
}
