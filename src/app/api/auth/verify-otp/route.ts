import { NextRequest, NextResponse } from "next/server";
import { VerifyOtpSchema } from "@/src/lib/validations";
import { verifyOtp } from "@/src/lib/otp";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = VerifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email, code } = parsed.data;

  const valid = await verifyOtp(email, code);
  if (!valid) {
    return NextResponse.json(
      { error: "Codigo incorrecto o expirado" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, email });
}
