import { Redis } from "@upstash/redis";

const OTP_TTL_SECONDS = 600; // 10 minutes
const OTP_PREFIX = "otp:";

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url === "https://placeholder.upstash.io") return null;

  _redis = new Redis({ url, token });
  return _redis;
}

export async function storeOtp(email: string, code: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    console.log(`[OTP-DEV] ${email}: ${code}`);
    return true;
  }
  await redis.set(`${OTP_PREFIX}${email}`, code, { ex: OTP_TTL_SECONDS });
  return true;
}

export async function verifyOtp(
  email: string,
  code: string
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true; // dev fallback: accept any code

  const stored = await redis.get<string>(`${OTP_PREFIX}${email}`);
  if (!stored || stored !== code) return false;

  await redis.del(`${OTP_PREFIX}${email}`);
  return true;
}
