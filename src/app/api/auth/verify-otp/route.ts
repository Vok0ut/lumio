import { NextRequest, NextResponse } from "next/server";
import { VerifyOtpSchema } from "@/src/lib/validations";
import { verifyOtp } from "@/src/lib/otp";
import { getOtpByEmail } from "@/src/lib/rate-limit";

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

  const limit = await (await getOtpByEmail()).limit(`verify:${email}`);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos." },
      { status: 429 }
    );
  }

  const token = await verifyOtp(email, code);
  if (!token) {
    return NextResponse.json(
      { error: "Codigo incorrecto o expirado" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, email, token });
}
