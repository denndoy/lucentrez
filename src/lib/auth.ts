import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "lucentrezn_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

function getSecret(): string {
  return process.env.ADMIN_SECRET ?? "lucentrezn-dev-secret";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSession(username: string): string {
  const issuedAt = Date.now().toString();
  const payload = `${username}.${issuedAt}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySession(token?: string | null): boolean {
  if (!token) {
    return false;
  }

  const [username, issuedAtRaw, signature] = token.split(".");
  if (!username || !issuedAtRaw || !signature) {
    return false;
  }

  const expected = sign(`${username}.${issuedAtRaw}`);
  if (expected !== signature) {
    return false;
  }

  const issuedAt = Number(issuedAtRaw);
  if (Number.isNaN(issuedAt)) {
    return false;
  }

  return Date.now() - issuedAt <= SESSION_TTL_MS;
}

export async function isAdminSessionFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(COOKIE_NAME)?.value);
}

export function isAdminRequest(request: NextRequest): boolean {
  return verifySession(request.cookies.get(COOKIE_NAME)?.value ?? null);
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME ?? "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "lucentrezn123";
  return username === expectedUser && password === expectedPassword;
}
