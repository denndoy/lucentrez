import { NextRequest, NextResponse } from "next/server";
import redis, { ensureRedisConnection, isRedisEnabled } from "@/lib/redis";

const ADMIN_WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 60 * 10;
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;

export function ensureSameOrigin(request: NextRequest): NextResponse | null {
  if (!ADMIN_WRITE_METHODS.has(request.method)) {
    return null;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return NextResponse.json({ message: "Missing Origin header" }, { status: 403 });
  }

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }

  return null;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function buildLoginRateLimitKey(request: NextRequest, username: string) {
  const safeUsername = username.trim().toLowerCase() || "unknown";
  const ip = getClientIp(request).replace(/[^a-zA-Z0-9:._-]/g, "_");
  return `lucentrez:rate-limit:admin-login:${ip}:${safeUsername}`;
}

export async function checkAdminLoginRateLimit(request: NextRequest, username: string) {
  if (!isRedisEnabled() || !redis) {
    return { allowed: true, remaining: LOGIN_RATE_LIMIT_MAX_ATTEMPTS };
  }

  const key = buildLoginRateLimitKey(request, username);
  await ensureRedisConnection();

  const attempts = await redis.incr(key);
  if (attempts === 1) {
    await redis.expire(key, LOGIN_RATE_LIMIT_WINDOW_SECONDS);
  }

  const ttl = await redis.ttl(key);
  return {
    allowed: attempts <= LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
    retryAfterSeconds: ttl > 0 ? ttl : LOGIN_RATE_LIMIT_WINDOW_SECONDS,
    remaining: Math.max(LOGIN_RATE_LIMIT_MAX_ATTEMPTS - attempts, 0),
  };
}

export async function clearAdminLoginRateLimit(request: NextRequest, username: string) {
  if (!isRedisEnabled() || !redis) {
    return;
  }

  await ensureRedisConnection();
  await redis.del(buildLoginRateLimitKey(request, username));
}
