import { NextResponse } from "next/server";
import { createSession, getAdminCookieName, validateAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = createSession(username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
