// Rate limiting con Upstash — opcional en desarrollo
// Si no hay credenciales de Redis, devuelve "siempre permitido"

const hasRedis =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_URL !== "" &&
  process.env.UPSTASH_REDIS_REST_URL !== "https://placeholder.upstash.io";

interface RateLimitResult {
  success: boolean;
  reset: number;
}

interface RateLimiter {
  limit: (identifier: string) => Promise<RateLimitResult>;
}

function createNoopLimiter(): RateLimiter {
  return {
    limit: async () => ({ success: true, reset: Date.now() + 60000 }),
  };
}

let _otpByIp: RateLimiter | null = null;
let _otpByEmail: RateLimiter | null = null;
let _apiByUser: RateLimiter | null = null;

async function getUpstashLimiters() {
  if (!hasRedis) return null;

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return {
    otpByIp: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "rl:otp:ip",
    }),
    otpByEmail: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "15 m"),
      prefix: "rl:otp:email",
    }),
    apiByUser: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      prefix: "rl:api:user",
    }),
  };
}

export async function getOtpByIp(): Promise<RateLimiter> {
  if (_otpByIp) return _otpByIp;
  if (!hasRedis) {
    _otpByIp = createNoopLimiter();
    return _otpByIp;
  }
  const limiters = await getUpstashLimiters();
  _otpByIp = limiters?.otpByIp ?? createNoopLimiter();
  return _otpByIp;
}

export async function getOtpByEmail(): Promise<RateLimiter> {
  if (_otpByEmail) return _otpByEmail;
  if (!hasRedis) {
    _otpByEmail = createNoopLimiter();
    return _otpByEmail;
  }
  const limiters = await getUpstashLimiters();
  _otpByEmail = limiters?.otpByEmail ?? createNoopLimiter();
  return _otpByEmail;
}

export async function getApiByUser(): Promise<RateLimiter> {
  if (_apiByUser) return _apiByUser;
  if (!hasRedis) {
    _apiByUser = createNoopLimiter();
    return _apiByUser;
  }
  const limiters = await getUpstashLimiters();
  _apiByUser = limiters?.apiByUser ?? createNoopLimiter();
  return _apiByUser;
}
