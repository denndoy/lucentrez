import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, getAdminCookieName, validateAdminCredentials } from "@/lib/auth";
import { logBackendError, parseJsonBody } from "@/lib/api";
import { checkAdminLoginRateLimit, clearAdminLoginRateLimit, ensureSameOrigin } from "@/lib/request-security";

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const originError = ensureSameOrigin(request);
  if (originError) {
    return originError;
  }

  const body = await parseJsonBody<unknown>(request);
  if (!body) {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", errors: parsed.error.issues }, { status: 400 });
  }

  const { username, password } = parsed.data;

  try {
    const rateLimit = await checkAdminLoginRateLimit(request, username);
    if (!rateLimit.allowed) {
      return NextResponse.json({ message: "Too many login attempts. Try again later." }, {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds ?? 60),
          "X-RateLimit-Remaining": String(rateLimit.remaining ?? 0),
        },
      });
    }

    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await clearAdminLoginRateLimit(request, username);

    const token = createSession(username);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    logBackendError("admin.login", error);
    return NextResponse.json({ message: "Authentication service unavailable" }, { status: 503 });
  }
}
