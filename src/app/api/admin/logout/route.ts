import { NextRequest, NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/auth";
import { ensureSameOrigin } from "@/lib/request-security";

export async function POST(request: NextRequest) {
  const originError = ensureSameOrigin(request);
  if (originError) {
    return originError;
  }

  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.set(getAdminCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
