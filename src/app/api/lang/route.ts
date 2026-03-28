import { NextRequest, NextResponse } from "next/server";
import { LANG_COOKIE, normalizeLang } from "@/lib/lang";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const lang = normalizeLang(typeof body.lang === "string" ? body.lang : undefined);

  const response = NextResponse.json({ ok: true, lang });
  response.cookies.set(LANG_COOKIE, lang, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
