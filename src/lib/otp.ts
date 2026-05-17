import { Redis } from "@upstash/redis";
import { randomBytes, timingSafeEqual } from "crypto";

const OTP_TTL_SECONDS = 600; // 10 minutes
const VERIFY_TOKEN_TTL = 300; // 5 minutes — window to call signIn
const OTP_PREFIX = "otp:";
const VERIFY_PREFIX = "verified:";

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
    if (process.env.NODE_ENV === "production") {
      console.error("[OTP] Redis is required in production but not configured");
      return false;
    }
    console.log(`[OTP-DEV] ${email}: ${code}`);
    return true;
  }
  await redis.set(`${OTP_PREFIX}${email}`, code, { ex: OTP_TTL_SECONDS });
  return true;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function verifyOtp(
  email: string,
  code: string
): Promise<string | null> {
  const redis = getRedis();

  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      console.error("[OTP] Redis is required in production but not configured");
      return null;
    }
    // dev fallback: accept code "000000"
    if (code !== "000000") return null;
    const token = randomBytes(32).toString("hex");
    return token;
  }

  const raw = await redis.get<string | number>(`${OTP_PREFIX}${email}`);
  if (!raw) return null;
  // Upstash deserializa strings numéricas como number — forzar a string
  const stored = String(raw);
  if (!safeEqual(stored, code)) return null;

  await redis.del(`${OTP_PREFIX}${email}`);

  // Issue a short-lived verification token
  const token = randomBytes(32).toString("hex");
  await redis.set(`${VERIFY_PREFIX}${email}`, token, { ex: VERIFY_TOKEN_TTL });

  return token;
}

export async function consumeVerifyToken(
  email: string,
  token: string
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      console.error("[OTP] Redis is required in production but not configured");
      return false;
    }
    return true; // dev fallback
  }

  const stored = await redis.get<string>(`${VERIFY_PREFIX}${email}`);
  if (!stored || !safeEqual(stored, token)) return false;

  await redis.del(`${VERIFY_PREFIX}${email}`);
  return true;
}
