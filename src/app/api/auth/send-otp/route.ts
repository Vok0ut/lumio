import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { SendOtpSchema } from "@/src/lib/validations";
import { storeOtp } from "@/src/lib/otp";
import { sendOtpEmail } from "@/src/lib/email";
import { getOtpByIp, getOtpByEmail } from "@/src/lib/rate-limit";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = SendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const [ipLimit, emailLimit] = await Promise.all([
    (await getOtpByIp()).limit(ip),
    (await getOtpByEmail()).limit(email),
  ]);

  if (!ipLimit.success || !emailLimit.success) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos." },
      { status: 429 }
    );
  }

  const code = String(randomInt(100000, 999999));

  await storeOtp(email, code);
  await sendOtpEmail(email, code);

  return NextResponse.json({ ok: true });
}
